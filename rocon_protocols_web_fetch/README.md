
Rocon Protocols Web Fetch
=========================

### Install
```sh
npm install rocon_protocols_web_fetch
```

### Requirements

아래의 두 명령이 실행가능하게 ROS 환경이 설정되어 있어야 합니다.

* `rosmsg list`
* `rosrun msg_database_scripts convert_msg_spec_to_json.py [type]`


### Run

#### Require

```js
var Fetch = require('rocon_protocols_web_fetch'),
  Message = Fetch.Message,
  HicApp = Fetch.HicApp,
  RoconApp = Fetch.RoconApp;
```

#### Fetch
##### Fetch message

```js
  Message(function(e, message_types){
    // message_types : array of ros msg types

  });

```

##### Fetch HicApp
```js
HicApp(list_url, function(e, hic_apps){
  // hic_apps : list of hic_apps
});
```

* list_url : the url for hic apps list yaml

##### Fetch RoconApp
```js
RoconApp(list_url, function(e, rocon_apps){
  // rocon_apps : list of rocon_apps
});
```
* list_url : the url for rocon apps list yaml
