import React from 'react';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { Accordion, Button, Form, FloatingLabel, ListGroup, Card, Table, Spinner, ProgressBar, OverlayTrigger, Tooltip, ButtonGroup, Dropdown, Modal } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';








function removeExistingModals(){
	let element = document.getElementById('my_modal_background');
	if (element) element.remove();
	element = document.getElementById('my_modal_body');
	if (element) element.remove();
}





const showThideF_Modal = (showThideF)=>{
	let element = document.getElementById('my_modal_background');
	if (element){
		if (showThideF) element.classList.add('show');
		else element.classList.remove('show');
	}
	element = document.getElementById('my_modal_body');
	if (element){
		if (showThideF) element.classList.add('show');
		else element.classList.remove('show');
	}
}



const check_modal_integrity = ()=>{
	//Cada 100ms comprobar si el background y el modal siguen existiendo; si alguno no existe, volver a cargar el modal de nuevo;
}





const resolve_modal = (result)=>{
	showThideF_Modal(false);

	setTimeout(()=>{
		//Limpiar los modals existentes (porque si no los limpiamos, se quedan ocupando la pantalla aunque no se vean)
		removeExistingModals();}
	, 200);

	console.log("modal resolve")
	return result;
}





function appendModalAndTriggerIt(text, confirmTalertF, accept_text="Sí, continuar", reject_text="No, cancel·lar"){

	//Limpiar los modals existentes
	removeExistingModals();

	accept_text = confirmTalertF ? accept_text : "D'acord";



	let modal_body = 
		`
		<div id="my_modal_background" class="fade modal-backdrop" style="z-index:9999999998"></div>

		<div id="my_modal_body" role="dialog" aria-modal="true" class="fade modal" tabindex="-1" style="padding-right: 16px; display: block; z-index:9999999999">

			<div class="modal-dialog modal-lg modal-dialog-centered">
				<div class="modal-content"><div class="modal-header">

					`+
						//"ViGtory!"
						`<div class="modal-title h4">ViGtory!</div>`
					//<div class="modal-title h4">Modal heading</div>
					
					+`
				
						<button
							id="my_modal_close"
							type="button"
							class="btn-close"
							aria-label="Close"
						></button>
				
					</div>
				
					<div class="modal-body">
						<h4>Centered Modal</h4>
						
						<p style="white-space: pre-wrap">`+
							text
						+`</p>

					</div>
					
					<div class="modal-footer">
						<button
							id="my_modal_dismiss"
							type="button"
							class="btn btn-secondary"
							data-dismiss="modal"
						>`
							+reject_text
							+`</button>
						<button 
							id="my_modal_accept"
							type="button"
							class="btn btn-primary">`
							+accept_text
							+`</button>
					</div>

				</div>
			</div>

		</div>
		`;




	let div = document.createElement("div");
	div.innerHTML = modal_body;
	let modal_bg = div.children[0];
	let modal = div.children[1];





	setTimeout(()=>{
		//window.document.body.innerHTML += modal_body; //Esto rompe React

		window.document.body.appendChild(modal_bg);
		window.document.body.appendChild(modal);


		
	}, 50);

	setTimeout(()=>{


		let element = document.getElementById('my_modal_close');
		if (element) element.onclick = ()=>{resolve_modal(false)};
		element = document.getElementById('my_modal_dismiss');
		if (element) element.onclick = ()=>{resolve_modal(false)};
		/*element = document.getElementById('my_modal_background');
		if (element) element.onclick = ()=>{resolve_modal(false)};*/
		element = document.getElementById('my_modal_accept');
		if (element) element.onclick = ()=>{resolve_modal(true)};
		



		showThideF_Modal(true);

	}, 100);



}













const init_modals = ()=>{

	window.alertModal = function(text) {

		appendModalAndTriggerIt(text, false);

	};


	window.confirmModal = function(text) {

		//window.modalConfirmed = ()=>false;

		return appendModalAndTriggerIt(text, true);
	};
	
}














export { init_modals }