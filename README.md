rocon_protocols_web
===================

![](https://travis-ci.org/robotics-in-concert/rocon_protocols_web.svg?branch=master)

## Installation
* nodejs 설치 : [https://github.com/joyent/node/wiki/installing-node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager#debian-and-ubuntu-based-linux-distributions)
* 패키지 clone
	* 임의의 경로에 최신 버젼을 내려받는다. (해당 경로)/rocon_protocols_webserver 는 프로젝트 루트가 된다
	* `git clone git@github.com:robotics-in-concert/rocon_protocols_web.git`
* 의존 패키지 설치
	* (프로젝트 루트)/rocon_protocols_webserver 이동 후 `npm install`

## Run
### ROS 개발 환경 설정
* 다음 명령어를 입력하여 ROS 개발환경을 셋팅 함

```bash
source /opt/ros/<ros version>/setup.bash
```


### Configuration

JSON 포멧으로 config 파일을 작성한다.

```json
{
  "port": 10000,
  "mongo_url": "mongodb://localhost:27017/rocon_protocols_web",
  "rocon_apps_url": "https://raw.githubusercontent.com/robotics-in-concert/rocon_protocols_web/master/rocon_protocols_webserver/distro/rocon_apps/rocon_apps.yaml",
  "hic_apps_url": "https://raw.githubusercontent.com/robotics-in-concert/rocon_protocols_web/master/rocon_protocols_webserver/distro/hic_apps/hic_apps.yaml"
}
```

  * `mongo_url` : 연결될 mongodb 의 URL (예, mongodb://localhost:27017/rocon_protocols_web)
  * `port` : API 웹 인터페이스 포트
  * `rocon_apps_url` : rocon apps 목록을 기술한 YAML의 URL
  * `hic_apps_url` : hic apps 목록을 기술한 YAML의 URL


### 실행
(프로젝트 루트)/rocon_protocols_webserver 에서 `node index.js --config /path/to/config.json` 실행

* parameters
	* `--config /path/to/config.json` (optional) : config 파일의 경로


## REST API specification

* Header : `Content-Type: application/json; charset=utf-8`

rocon_protocols_web 의 REST API 는 별도로 언급되지 않는 한 data format은  application/json, 텍스트 인코딩 type은  UTF-8 로 응답한다.

### Administration Methods
#### `api/ping`

* Parameters : 없음
* Method : GET
* Returns : 텍스트 “pong” 리턴 (text/html)

```bash
$ curl http://localhost:10000/api/ping
```
```text
pong
```

### Message information query methods
#### `/message_details`

* Parameters
  * type : 메세지 타입.
* Method : GET
* Returns : Parameter ‘type’ 으로 전달 받은 타입과 의존하는 모든 타입의 정보를 배열의 형태로 리턴.

```bash
$ curl "http://localhost:10000/api/message_details?type=std_msgs/String"
```


```json
[
    {
        "constantnames": [],
        "constanttypes": [],
        "constantvalues": [],
        "fieldarraylen": [
            -1
        ],
        "fieldnames": [
            "data"
        ],
        "fieldtypes": [
            "string"
        ],
        "text": "string data\n",
        "type": "std_msgs/String"
    }
]
```


필드 | 설명
--- | ---
constantnames | 메세지 타입에 정의된 상수의 이름 목록
constanttypes | 메세지 타입에 정의된 상수의 타입 목록
constantvalues | 메세지 타입에 정의된 상수의 값 목록
fieldarraylen | 타입에 선언된 field의 cardinality (-1: 단일 값, 0: 사이즈 정해지지 않은 배열, N: N개의 배열)
fieldtypes | 타입 필드의 타입 목록
fieldnames | 타입 필드의 이름 목록
text | 해당 타입을 선언한 메세지 전문 (참고, http://wiki.ros.org/msg)
type | 요청한 타입의 이름


*  Error : Parameter ‘type’ 에 해당하는 타입이 존재하지 않을 경우 빈 배열([])을 리턴

#### `/api/rocon_app`
* Parameters : 없음
* Method : GET
* Returns : rapp.tar.gz 파일 을 통해 rocon_protocols_web 에 등록된 rapp 들 중에서 interface를 정의한 rapp 목록을 리턴. 예,

```bash
$ curl http://localhost:10000/api/rocon_app
```

```json
 [
     {
        "name": "rocon_hue",
        "rocon_apps": {
            "hue_bridge": {
                "compatibility": "rocon:/pc",
                "description": "The bridge for getting bulb status and contollering",
                "display": "Hue Bridge ",
                "interfaces": {
                    "action_clients": [],
                    "action_servers": [],
                    "publishers": [
                        {
                            "name": "list_hue",
                            "type": "rocon_device_msgs/HueArray"
                        }
                    ],
                    "services": [],
                    "subscribers": [
                        {
                            "name": "set_hue",
                            "type": "rocon_device_msgs/Hue"
                        }
                    ]
                },
                "key": "hue_bridge",
                "launch": "hue_bridge.launch",
                "public_interface": "hue_bridge.interface"
            }
        }
    }, …]
```

필드 | 설명
---|---
name | rapp 이름
rocon_apps | rapp 에 정의된 app 의 메타정보
rocon_apps.(app).public_interface | app 에서 선언된 interface 목록
rocon_apps.(app).public_interface.action_servers | app 의 action server 의 이름(name) 과 타입(type)
rocon_apps.(app).public_interface.subscribers | app 의 subscriber 의 이름(name) 과 타입(type)
rocon_apps.(app).public_interface.publishers | app 의 publisher 의 이름(name) 과 타입(type)



#### `/api/hic_app`
* Parameters : 없음
* Method : GET
* Returns : rocon_protocols_web DB 에 등록된 client app 중 interface 를 정의한 client app 목록을 리턴.

```bash
$ curl "http://localhost:10000/api/hic_app"
```

```json
[
    {
        "_id": "54864e0624da409c4a63979d",
        "compatibility": "rocon:/*/*/indigo/jellybean",
        "defaults": {
            "description": "A Android listener for testing pairing.",
            "display_name": "Listener",
            "max": -1
        },
        "interface": {
            "description": "Chatting room",
            "name": "chatter",
            "type": "std_msgs/String"
        },
        "name": "com.github.rosjava.android_remocons.listener.Listener"
    }
]
```



필드 | 설명
defaults | interaction 파일 저작에 사용되는 기본 정보 (이름, 설명, max 값)
interface | 인터페이스 정의
interface.name | 인터페이스 이름, (클라이언트에서 publish 할 토픽의 이름)
interface.type | 인터페이스 타입, (클라이언트에서 publish 할 데이터의 타입)

