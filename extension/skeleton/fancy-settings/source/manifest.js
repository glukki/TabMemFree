this.manifest = {
    'name': 'TabMemFree',
    'icon': '../../img/icon30.png',
    'settings': [
        {
            'tab': 'Settings',
            'group': 'Timelimits',
            'name': 'timeout',
            'type': 'slider',
            'label': 'Tab timeout',
            'max': 24 * 60 * 60,
            'min': 15 * 60,
            'step': 15 * 60,
            'display': true,
            'displayModifier': function (value) {
                "use strict";
                return Math.floor(value / 60) + ' min.';
            }
        },
        {
            'tab': 'Settings',
            'group': 'Timelimits',
            'name': 'timeout-description',
            'type': 'description',
            'text': 'How long may tab stay ignored before it is parked'
        },
        {
            'tab': 'Settings',
            'group': 'Timelimits',
            'name': 'tick',
            'type': 'slider',
            'label': 'Check period',
            'max': 15 * 60,
            'min': 60,
            'step': 60,
            'display': true,
            'displayModifier': function (value) {
                "use strict";
                return Math.floor(value / 60) + ' min.';
            }
        },
        {
            'tab': 'Settings',
            'group': 'Timelimits',
            'name': 'tick-description',
            'type': 'description',
            'text': 'How often does extension check if any tab should be parked'
        },
        {
            'tab': 'Settings',
            'group': 'Exceptions',
            'name': 'pinned',
            'type': 'checkbox',
            'label': 'Pinned'
        },
        {
            'tab': 'Settings',
            'group': 'Exceptions',
            'name': 'pinned-description',
            'type': 'description',
            'text': 'Don\'t park pinned tabs'
        }
    ],
    'alignment': [
        [
            'timeout',
            'tick'
        ]
    ]
};
