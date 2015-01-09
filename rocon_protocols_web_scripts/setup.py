#!/usr/bin/env python

from distutils.core import setup
from catkin_pkg.python_setup import generate_distutils_setup

d = generate_distutils_setup(
    packages=['rocon_protocols_web_scripts'],
    scripts=['scripts/convert_msg_spec_to_json.py'],
)

setup(**d)
