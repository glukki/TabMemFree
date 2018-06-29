TODO:
- build automation
- prettier
- track extension version with google analytics
- store settings in chrome.storage - http://developer.chrome.com/extensions/storage
- prevent tabs parking by urls blacklist
- show before/after resources allocation comparison - http://developer.chrome.com/extensions/processes
- suggest cpu/memory upgrade - http://developer.chrome.com/extensions/system_memory http://developer.chrome.com/extensions/system_cpu
- toggle current tab parking from omnibox - http://developer.chrome.com/extensions/omnibox

storage algo:
1. work with 'local'
2. push to 'sync' with some time threshold
3. update 'local' with 'onChanged' handler
4. use 'sync' constraints on size and keys amount

