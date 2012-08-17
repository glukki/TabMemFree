/**
 * Created by IntelliJ IDEA.
 * User: Vitaliy (GLuKKi) Meshchaninov glukki.spb.ru@gmail.com
 * Date: 27/08/11
 * Time: 16:15
 * To change this template use File | Settings | File Templates.
 */
/*jslint browser: true, devel: true*/
/*global chrome*/

"use strict";

window.onfocus = function(){ history.back(); }
window.onload = function(){
	var param = location.href.substring(location.href.indexOf("#") + 1);
	set_info( JSON.parse(decodeURIComponent(param)) );
}

function set_info(msg) {
	set_title(msg.title);
	set_icon(msg.icon);
}

//set old title
function set_title(title) {
	document.title = title;
}

//set old favicon
function set_icon(href) {
	if (!href) return;
	var link = document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'icon';
	link.href = href;
	document.getElementsByTagName('head')[0].appendChild(link);
}
