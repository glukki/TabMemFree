// SAMPLE
this.manifest = {
    "name": "TabMemFree",
    "icon": "../../img/icon30.png",
    "settings": [
        {
            "tab": "Common",
            "group": " ",
            "name": "timeout",
            "type": "slider",
            "label": "Timeout",
            "max": 30*60,
            "min": 15,
            "step": 15,
            "display": true,
            "displayModifier": function(value){
                return (value/60).floor() + " min.";
            }
        },
        {
            "tab": "Common",
            "group": " ",
            "name": "tick",
            "type": "slider",
            "label": "Tick",
            "max": 15*60,
            "min": 5,
            "step": 5,
            "display": true,
            "displayModifier": function(value){
                return (value).floor() + " sec.";
            }
        }
    ],
    "alignment": [
        [
            'timeout',
            'tick'
        ]
    ]
};
