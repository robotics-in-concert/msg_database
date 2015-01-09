#!/usr/bin/env python
'''
Gets message specification from file and stdouts rocon_protocols_web_msgs/TypeDefinition JSON format
'''

import os
import sys
import rospkg
import rosmsg
import genmsg
from rocon_protocols_web_msgs.msg import TypeDefinition
from rospy_message_converter import json_message_converter

class ROSMsgException(Exception): pass

def get_search_path():
    rospack = rospkg.RosPack()
    search_path = {}
    for p in rospack.list():
        package_paths = rosmsg._get_package_paths(p, rospack)
        search_path[p] = [os.path.join(d, 'msg') for d in package_paths]
    return search_path


def get_spec(msg_type, search_path):
    context = genmsg.MsgContext.create_default()
    try:
        spec = genmsg.load_msg_by_type(context, msg_type, search_path)
        genmsg.load_depends(context, spec, search_path)
    except Exception as e:
        raise ROSMsgException("Unable to load msg [%s]: %s"%(msg_type, e))
    return spec

def spec_to_typedef_msg(spec):
    typedef = TypeDefinition()
    typedef.type = spec.full_name

    typedef.fieldtypes = []
    typedef.fieldnames = []
    typedef.fieldarraylen = []
    for type_, name in zip(spec.types, spec.names):
        t, is_array, length = parse_type(type_)
        typedef.fieldtypes.append(t)
        typedef.fieldnames.append(name) 
        
        if is_array:
            if length:
                typedef.fieldarraylen.append(length)
            else:
                typedef.fieldarraylen.append(0)
        else:
            typedef.fieldarraylen.append(-1)
    
    typedef.constantnames  = []
    typedef.constanttypes  = []
    typedef.constantvalues = []
    for const in spec.constants:
        typedef.constantnames.append(const.name)
        typedef.constanttypes.append(const.type)
        typedef.constantvalues.append(const.val)
    typedef.text = spec.text

    return typedef

def print_spec(spec):
    ## spec is genmsg.MsgSpec object. Look https://github.com/ros/genmsg/blob/indigo-devel/src/genmsg/msgs.py#L228 for the details.
    print(type(spec))

    # Check rosmsg.spec_to_str to print out full message spec with dependent mesasges. https://github.com/ros/ros_comm/blob/indigo-devel/tools/rosmsg/src/rosmsg/__init__.py#L365 
    print('Name  : ' + spec.full_name)

    print('== Variables ==')
    for type_, name in zip(spec.types, spec.names): 
        print('%s(%s)'%(name, type_))

    print('')

    # Constant is genmsg.Consant object. Look https://github.com/ros/genmsg/blob/indigo-devel/src/genmsg/msgs.py#L158
    print('== Constants ==')
    print(str(spec.constants))


#NOTE: Copied from genmsgs.msgs.py
#NOTE: this assumes that we aren't going to support multi-dimensional
def parse_type(msg_type):
    """
    Parse ROS message field type
    :param msg_type: ROS field type, ``str``
    :returns: base_type, is_array, array_length, ``(str, bool, int)``
    :raises: :exc:`ValueError` If *msg_type* cannot be parsed
    """
    if not msg_type:
        raise ValueError("Invalid empty type")
    if '[' in msg_type:
        var_length = msg_type.endswith('[]')
        splits = msg_type.split('[')
        if len(splits) > 2:
            raise ValueError("Currently only support 1-dimensional array types: %s"%msg_type)
        if var_length:
            return msg_type[:-2], True, None
        else:
            try:
                length = int(splits[1][:-1])
                return splits[0], True, length
            except ValueError:
                raise ValueError("Invalid array dimension: [%s]"%splits[1][:-1])
    else:
        return msg_type, False, None


if __name__ == '__main__':

    if len(sys.argv) < 2:
        print 'Usage : get_msg_spec.py <MESSAGE TYPE> [MESSAGE TYPE ...]'
        sys.exit(0)

    msg_types = sys.argv[1:]
    search_path = get_search_path()

    for msg_type in msg_types:
        spec = get_spec(msg_type, search_path)
        typedef = spec_to_typedef_msg(spec)
        json_typedef = json_message_converter.convert_ros_message_to_json(typedef)   
        print(json_typedef)
