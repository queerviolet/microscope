var eventId = 0;

function logEvents(node, func) {
	/*if (node.microscopeAttached) {
		console.log('cycle detected');
		return;
	}*/
	node.microscopeAttached = true;
	for (var prop in node) {
		if (prop.match(/^on(.*)/)) {
			var eventName = prop.substr(2);
			node.addEventListener(eventName, function(node, eventName, event) {
				if (typeof event.microscopeId == 'undefined') {
					event.microscopeId = eventId++;
				}
				func.apply(null, Array.prototype.slice.apply(arguments));
			}.bind(null, node, eventName));
		}
	}
	if (node.childNodes) {
		for (var i = 0; i != node.childNodes.length; ++i) {
			logEvents(node.childNodes[i], func);
		}
	}
	if (node.document) {
		logEvents(node.document, func);
	}
}

function log(node, eventName, event, x) {
	/*event.bt = event.bt || [];
	event.bt.push({node: node, name: eventName, evt: event});
	console.log(event.bt);*/
//	if (eventName == 'mousemove') return;

	var eventBoxId = 'event_' + event.microscopeId
	var eventBox = document.getElementById(eventBoxId);
	if (eventBox == null) {
		if (typeof node.getBoundingClientRect != 'undefined') {
			var box = node.getBoundingClientRect();
		} else {
			var box = {top: 0, left: 0};		
		}
		var top = (event.pageY || box.top) + 'px';
		var left = (event.pageX || box.left) + 'px';
		var containerId = 'events_at_' + top + '_' + left
		var container = document.getElementById(containerId);
		if (container == null) {
			container = document.createElement('events');
			container.id = containerId;
			container.style.top = top;
			container.style.left = left;
			container.style.position = 'absolute';
			document.body.appendChild(container);
		}
		eventBox = document.createElement('event');
		eventBox.id = eventBoxId;
		var name = document.createElement('name');
		name.textContent = eventName;
		eventBox.appendChild(name);
		container.appendChild(eventBox);
	}

	var block = document.createElement('bubbled');
	block.textContent = node.tagName? '<' + node.tagName.toLowerCase() + '>' : node.toString();
	eventBox.appendChild(block);
	setTimeout(function() {
		if (!document.body.contains(block))
			return;
		if (eventBox.parentNode.childNodes.length == 1) {
			console.log(eventBox.parentNode);
			document.body.removeChild(eventBox.parentNode);
			return;
		}
		if (eventBox.childNodes.length == 2) {
			eventBox.parentNode.removeChild(eventBox);
			return;
		}
		eventBox.removeChild(block);
	}, 1000);
	//console.log.apply(console, Array.prototype.slice.apply(arguments));
}

function main() {
	logEvents(window, log);
}
window.addEventListener('load', main);