(function() {
	var PICKDRAGTHRESHOLD = 10;
	var ORBITSPEEDFACTOR = 0.05;
	var MAXORBITSPEED = Math.PI * 0.1;
	var PANSPEEDFACTOR = 0.6;
	var ZOOMSPEEDFACTOR = 0.05;

	BIMViewportEventListener = function(viewportId, bimSceneManager) {

		this.sceneManager = bimSceneManager;
		this.viewport = {
			domElement : viewportDOMElement,
			selectedIfcObject : null,
			mouse: {
				last: [0, 0],
				leftDown: false,
				middleDown: false,
				leftDragDistance: 0,
				middleDragDistance: 0,
				pickRecord: null
			}
		};

		var viewportDOMElement = document.getElementById(viewportId);
		var me = this;
		$(viewportDOMElement).mousedown( //
			function(event) {
				mouseDown(event, me);
			} //
		);

		$(viewportDOMElement).mouseup( //
			function(event) {
				mouseUp(event, me);
			}
		);

		$(viewportDOMElement).mousemove( //
			function(event) {
				mouseMove(event, me);
			}
		);

		viewportDOMElement.addEventListener( //
			'mousewheel', //
			function(event) {
				mouseWheel(event, me);
			}, //
			false //
		);


//		$("#controls-wrapper-collapse").click(function() {
//			BIMSurfer.toggleControls();
//		});

	};

	function mouseDown(event, me) {
		var coords, picknode;
		if (me.sceneManager.scene == null) {
			return;
		}

		me.viewport.mouse.last = [event.clientX, event.clientY];

		switch (event.which) {
		case 1:
			me.viewport.mouse.leftDown = true;
			break;
		case 2:
			me.viewport.mouse.middleDown = true;
		}

		if (event.which === 1) {
			coords = mouseCoordsWithinElement(event);
			// check if selected Object is a special object
			me.viewport.mouse.pickRecord = me.sceneManager.scene.pick(coords[0], coords[1]);

			if (me.viewport.mouse.pickRecord != null) {
				picknode = me.sceneManager.scene.findNode(me.viewport.mouse.pickRecord.name);
				// if selected element begins with dp_ (marks special object)
				if ($('#' + RegExp.escape(picknode.get("id"))).text().match(/^ dp_/)) {
					if (me.sceneManager.propertyValues.selectedObj == ($('#' + RegExp.escape(picknode.get("id"))).text())) {
						window._BIM_LOGGER.log("No special object selected");
					} else {
						me.sceneManager.propertyValues.selectedObj = ($('#' + RegExp.escape(picknode.get("id"))).text());
						//call GWT Application
						//GWT: window.callbackAddDpWidget(othis.propertyValues.selectedObj,coords[0], coords[1]);
					}
					me.viewport.mouse.leftDown = false;
					//GWT: window.callbackClickEventDatapointMove(othis.propertyValues.selectedObj);
					event.preventDefault();
				} else {
					me.sceneManager.propertyValues.selectedObj = 'emtpy Selection';
				}
			}

			return 0;
		}
	};

	function mouseUp(event, me) {
		if (me.sceneManager.scene == null) {
			return;
		}

		if (event.which === 1
				&& me.viewport.mouse.leftDragDistance < PICKDRAGTHRESHOLD
				&& me.viewport.mouse.middleDragDistance < PICKDRAGTHRESHOLD) {

			if (me.viewport.mouse.pickRecord != null) {
				me.sceneManager.selectObject(me.viewport.mouse.pickRecord.name);
			} else {
				me.sceneManager.clearSelection();
			}

			me.viewport.mouse.pickRecord = null;
		}

		// switch between Navigation Mode (pan/rotate)
		var navigationMode = me.sceneManager.getNavigationMode();
		switch (navigationMode) {
		case 0:
			me.viewport.mouse.leftDragDistance = 0;
			break;
		case 1:
			me.viewport.mouse.middleDragDistance = 0;
			break;
		}

		switch (event.which) {
		case 1:
			me.viewport.mouse.leftDown = false;
			return me.viewport.mouse.leftDragDistance = 0;
		case 2:
			me.viewport.mouse.middleDown = false;
			return me.viewport.mouse.middleDragDistance = 0;
		}
	};

	function mouseMove(event, me) {
		var delta, deltaLength, orbitAngles, panVector;

		delta = [ //
			event.clientX - me.viewport.mouse.last[0], //
			event.clientY - me.viewport.mouse.last[1] //
		];

		if (delta[0] == 0 && delta[1] == 0) {
			return; // avoids disappearing
		}

		// object
		deltaLength = SceneJS_math_lenVec2(delta);
		if (me.viewport.mouse.leftDown) {
			// check which navigation mode is activated
			if (me.sceneManager.getNavigationMode() == 0) {
				me.viewport.mouse.leftDragDistance += deltaLength;
			} else {
				me.viewport.mouse.middleDragDistance += deltaLength;
			}
		}

		if (me.viewport.mouse.middleDown) {
			me.viewport.mouse.middleDragDistance += deltaLength;
		}

		if (me.viewport.mouse.leftDown 
			&& event.which === 1) {

			if (me.sceneManager.getNavigationMode() == 0) {
				orbitAngles = [ 0.0, 0.0 ];
				SceneJS_math_mulVec2Scalar(delta, ORBITSPEEDFACTOR / deltaLength, orbitAngles);
				orbitAngles = [ //
					Math.clamp(orbitAngles[0], -MAXORBITSPEED, MAXORBITSPEED), //
					Math.clamp(orbitAngles[1], -MAXORBITSPEED, MAXORBITSPEED) //
				];

				if ((isNaN(orbitAngles[0])) || (Math.abs(orbitAngles[0])) === Infinity) {
					orbitAngles[0] = 0.0;
				}

				if ((isNaN(orbitAngles[1])) || (Math.abs(orbitAngles[1])) === Infinity) {
					orbitAngles[1] = 0.0;
				}

				me.sceneManager.orbitLookAtNode( //
					me.sceneManager.scene.findNode('main-lookAt'), //
					orbitAngles, [ 0.0, 0.0, 1.0 ] //
				);

			} else {
				panVector = [ 0.0, 0.0 ];
				SceneJS_math_mulVec2Scalar( //
					[-delta[0], delta[1]], //
					PANSPEEDFACTOR * 1 / me.sceneManager.propertyValues.scalefactor / deltaLength, //
					panVector //
				);

				me.sceneManager.lookAtNodePanRelative( //
					me.sceneManager.scene.findNode('main-lookAt'), //
					panVector //
				);
			}

		} else if (me.viewport.mouse.middleDown && event.which === 2) {
			panVector = [0.0, 0.0];
			SceneJS_math_mulVec2Scalar( //
				[-delta[0], delta[1]], //
				PANSPEEDFACTOR * 1 / me.sceneManager.propertyValues.scalefactor / deltaLength, //
				panVector //
			);

			me.sceneManager.lookAtNodePanRelative( //
				me.sceneManager.scene.findNode('main-lookAt'), //
				panVector //
			);
		}

		return me.viewport.mouse.last = [event.clientX, event.clientY];
	};

	function mouseWheel(event, me) {
		var delta, zoomDistance;
		if (me.sceneManager.scene == null) {
			return;
		}

		delta = event.wheelDelta != null ? event.wheelDelta / -120.0 : Math.clamp(event.detail, -1.0, 1.0);

		me.sceneManager.propertyValues.oldZoom = Math.clamp(me.sceneManager.propertyValues.oldZoom + delta, 0, 20);

		//GWT: window.callbackZoomLevelAbsolute(othis.propertyValues.oldZoom);
		zoomDistance = delta * me.sceneManager.camera.distanceLimits[1] * ZOOMSPEEDFACTOR;

		return me.sceneManager.zoomLookAtNode( //
			me.sceneManager.scene.findNode('main-lookAt'), //
			zoomDistance, //
			me.sceneManager.camera.distanceLimits //
		);
	};

	function mouseCoordsWithinElement(event) {
		var coords, element, totalOffsetLeft, totalOffsetTop;
		coords = [ 0, 0 ];
		if (!event) {
			event = window.event;
			coords = [ event.x, event.y ];
		} else {
			element = event.target;
			totalOffsetLeft = 0;
			totalOffsetTop = 0;
			while (element.offsetParent) {
				totalOffsetLeft += element.offsetLeft;
				totalOffsetTop += element.offsetTop;
				element = element.offsetParent;
			}
			coords = [ event.pageX - totalOffsetLeft, event.pageY - totalOffsetTop ];
		}
		return coords;
	};
})();