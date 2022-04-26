import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
import PropTypes from 'prop-types';
//import ReactDOM from 'react-dom';
//import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";

import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

import { Accordion, Button, Container, Form, FloatingLabel } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/ProfileSettings.css';

import { Cookie } from '../libraries/cookie';
import {getDegreeList, getValidationRegexAndErrorMessages, getUserData} from '../libraries/data_request';
import { waitFor } from '@testing-library/dom';

import {BaseName} from "../libraries/basename";


//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);
















async function submitUpdateDataToAPI(event, route, navigate){
	//console.log(event.currentTarget.action);
	//event.currentTarget.submit();
	event.currentTarget.action = API_address + "/user/" + route;
	//event.currentTarget.action = "http://nekoworld.dynu.net" + "/user/" + route;
	//console.log(event.currentTarget.action);
	//event.currentTarget.submit();

	const data = new URLSearchParams();
	for (const pair of new FormData(event.currentTarget)) {
		data.append(pair[0], pair[1]);
	}
	//console.log("DATA===============\n\n"+data+"\n\n==================");




	//https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch
	//https://dmitripavlutin.com/javascript-fetch-async-await/
	//https://dmitripavlutin.com/timeout-fetch-request/
	
	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";


	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	//headers.append("Content-Type", "text/plain");
	//headers.append("Content-Type", "application/json");
	headers.append("Content-Type", "application/x-www-form-urlencoded");
	//headers.append("Access-Control-Allow-Origin", "*");
	

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		event.currentTarget.action, {
			method: "POST",
			mode: 'cors',
			body: data,
			headers: headers,
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
				
				//window.alert("Operació realitzada correctament. Es tornarà a carregar la pantalla actual.");
				window.alert("Operació realitzada correctament."
				
				+ ( (route.toLowerCase()).includes("correu") ? "\n\nPer a terminar de fer efectiva l'operació, caldrà que utilitzis l'enllaç que trobaràs al missatge que hem enviat a la teva nova adreça de correu electrònic." : "")
				);
				
				//Si todo va bien, podríamos hasta volver a cargar la página para mostrar los nuevos datos!
				//location.reload();
			}
			/*else{
				window.alert(resp.statusText);
				return;
			}*/
			
			return response;
		}, 
		resp => { //NO ha sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	.then(
		data => {
			if (data === undefined) return;

			if (!resp_ok){
				window.alert(data.error);
				return;
			}
		}
	);
	
}






























function validate_content_regex(content, validations){
	//Comprobamos errores de formato con Regex
	//let content = event.currentTarget.value;
	//console.log(content);

	for (let i = 0; i < validations.length; i++) {
		//console.log(Object.keys(validations[i])[0]);

		let regex = Object.keys(validations[i])[0];
		//console.log(regex.slice(1, -1));
		//console.log( new RegExp(regex.slice(1, -1)).test(content) );

		if (! ( new RegExp(regex.slice(1, -1)).test(content) ) ){
			return validations[i][regex];
		}
	}
	return false;
}











/*
class UsernameInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			valid: true,
			err_msg: ""
		};
		this.content_txt = "";
		this.valid = true;
	}


	validate_content_clientside(event){

		let content = event.currentTarget.value;
		//console.log(content);

		if ( (content.length > 0) && (!(this.props.form_field_name.split("_")[0] === "login")) ){

			//Comprobamos errores de formato con Regex
			let regex_val_err_msg = validate_content_regex(content, this.props.validation_rgx_msg);
			if (regex_val_err_msg !== false){
				//console.log("err_msg: " + regex_val_err_msg);
				this.setState({
					valid: false,
					//err_msg: validations[i][regex]
					err_msg: regex_val_err_msg
				});
				this.valid = false;
				//console.log("err_msg: " + this.state.err_msg);
				return;
			}

		}

		//Si todo es correcto
		this.setState({
			valid: true,
			err_msg: ""
		});
		this.valid = true;
	}


	render(){
		//console.log(this.props.validation_rgx_msg[0]);

		return(

			<Form.Floating className="mt-3">
					{
						//onChange={this.validate_content_clientside.bind(this)}
					}
				<Form.Control
					type="text" 
					name={"username"} 
					placeholder="usuari" 
					defaultValue={this.props.defaultValue}
					onChange={(e) => {this.content_txt=e.currentTarget.value; this.validate_content_clientside(e); this.props.global_validity_action();}}
					required 
					isInvalid={!this.state.valid}
				/>
				<Form.Control.Feedback type="invalid">
					{this.state.err_msg}
				</Form.Control.Feedback>
				<label htmlFor="floatingInputCustom">Nom d'usuari</label>

			</Form.Floating>

		);
	};
}
*/









class PasswordInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			valid: true,
			err_msg: "",
			pwTconfF: props.pwTconfF,
			oldTnewF: props.oldTnewF
		};
		this.content_txt = "";
		this.valid = true;
	}


	validate_content_clientside(){


		let password_txt = this.content_txt; //event.currentTarget.value;
		//console.log(this.props.form_field_name + ":   " + password_txt);

		let valid = true;
		let err_msg = "";
		let pwTconfF = this.state.pwTconfF;
		let oldTnewF = this.state.oldTnewF;

		if ( (password_txt.length > 0) && (!this.state.oldTnewF) ){
			//Si es un campo de contraseña original
			if (pwTconfF){

				//Actualizamos la contraseña común para la confirmación
				this.props.main_password_action(password_txt);
				
				//Comprobamos errores de formato con Regex
				let regex_val_err_msg = validate_content_regex(password_txt, this.props.validation_rgx_msg);
				if (regex_val_err_msg !== false){
					
					valid = false;
					err_msg = regex_val_err_msg;

				}
			}
			//Si es un campo de confirmar contraseña
			else{
				//Comprobamos que las contraseñas coincidan
				if ((this.props.main_password_action() !== password_txt)){
					valid = false;
					err_msg = "Les contrasenyes han de coincidir.";
				}
			}
		}

		//Actualizamos el estado
		this.setState({
			valid: valid,
			err_msg: err_msg,
			pwTconfF: pwTconfF,
			oldTnewF: oldTnewF
		});
		this.valid = valid;
	}



	render(){
		let pwTconfF = this.state.pwTconfF;
		let oldTnewF = this.state.oldTnewF;
		/*
		//Contraseña normal
		if (this.props.form_field_name.split("_").length < 3){
			//console.log(this.props.validation_rgx_msg[0]);
		}
		//Confirmar contraseña
		else {

		}*/
		return(

			<Form.Floating className={"mt-"+(pwTconfF ? "3":"1")+" mb-"+(pwTconfF ? "1":"3")}>
				<Form.Control
					type="password"
					name={(oldTnewF ? "p" : (pwTconfF ? "new" : "confirm") + "P") + "assword"}
					placeholder="contrasenya" 
					defaultValue=""
					onChange={(e) => {this.content_txt=e.currentTarget.value; this.validate_content_clientside(); this.props.global_validity_action();}}
					required 
					isInvalid={!this.state.valid}
				/>
				<Form.Control.Feedback type="invalid">
					{this.state.err_msg}
				</Form.Control.Feedback>
				<label htmlFor="floatingInputCustom">{
					//pwTconfF ? "Contrasenya (nova)" : "Confirmar contrasenya"
					//(pwTconfF ? ("Contrasenya (" + (oldTnewF?"actual":"nova") + ")"):"Confirmar contrasenya")
					(oldTnewF?"Contrasenya (actual)":(pwTconfF?"Contrasenya (nova)":"Confirmar contrasenya"))

					}</label>
			</Form.Floating>

		);
	};
}











class MailInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			valid: true,
			err_msg: ""
		};
		this.content_txt = "";
		this.valid = true;
	}


	validate_content_clientside(event){

		let content = event.currentTarget.value;

		if (content.length > 0){

			//Comprobamos errores de formato con Regex
			let regex_val_err_msg = validate_content_regex(content, this.props.validation_rgx_msg);
			if (regex_val_err_msg !== false){
				this.setState({
					valid: false,
					err_msg: regex_val_err_msg
				});
				this.valid = false;
				return;
			}
			else{
				if (this.props.mail_student && (content.split("@")[1]!=="estudiantat.upc.edu")){
					this.setState({
						valid: false,
						err_msg: "Cal que aquesta direcció de correu electrònic sigui del domini @estudiantat.upc.edu."
					});
					this.valid = false;
					return;
				}
			}

		}

		//Si todo es correcto
		this.setState({
			valid: true,
			err_msg: ""
		});
		this.valid = true;
	}


	


	render(){
		let disabled = (this.props.mail_student && this.props.confirmed && (this.props.defaultValue !== ""));
		//disabled={disabled}

		return(

			<Form.Floating className="mt-3">
				<Form.Control
					type="email" 
					name={"email"} 
					placeholder={this.props.mail_student?"usuari@estudiantat.upc.edu":"usuari@domini.xyz"} 
					defaultValue={this.props.defaultValue}
					onChange={(e) => {this.content_txt=e.currentTarget.value; this.validate_content_clientside(e); this.props.global_validity_action();}}
					required 
					isInvalid={!this.state.valid}
					readOnly={disabled}
				/>
				<Form.Control.Feedback type="invalid">
					{this.state.err_msg}
				</Form.Control.Feedback>
				<label htmlFor="floatingInputCustom">Correu electrònic{this.props.mail_student?" d'estudiant":""}</label>

			</Form.Floating>

		);
	};
}






class DegreeInput extends React.Component {

	/*constructor(props) {
		super(props);
	}*/

	render(){
		//return(<Form.Select field_name="Grau d'estudis" form_field_name="degree"/>);
		//selected={i===this.props.defaultValue}
		let degreeList = this.props.degreeList ? this.props.degreeList : [];
		
		return(

			<FloatingLabel className="mt-3 mb-2" label="Grau d'estudis d'interès">
				<Form.Select name={"grau"} defaultValue={this.props.defaultValue} >

					{/*this.props.degreeList.map((deg_name, i) => { return (
						<option 
							value={i} 
							key={i}
						>
							{deg_name} {(i===this.props.defaultValue)?"[ACTUALMENT]":""}
						</option>
					)})*/
					degreeList.map((deg) => { return (
						<option value={deg.codi_programa} key={deg.codi_programa}>
							{deg.nom} {(deg.codi_programa===this.props.defaultValue)?"[ACTUALMENT]":""}
						</option>
					)})
					}

				</Form.Select>
			</FloatingLabel>

		);
	};
}















function ScreenToggle({ children, eventKey, updateSettingsNav }){
	const switchScreen = useAccordionButton(eventKey, ()=>{
		//console.log("Accordion "+eventKey+" triggered!");
		//console.log(eventKey.slice(eventKey.indexOf('_') + 1));
		changeURLandTitle(eventKey.slice(eventKey.indexOf('_') + 1));
	});

	/*let updateScreen = (eventKey)=>{
		if (updateSettingsNav(eventKey)){
			changeURLandTitle(eventKey.slice(eventKey.indexOf('_') + 1));
			switchScreen();
		}
	};*/
	
	return(
		<Nav.Link 
			eventKey={eventKey} 
			className="d-flex justify-content-center align-items-center" 
			className="interactiveToggle"
			onClick={()=>{
				if (updateSettingsNav(eventKey))
					switchScreen();
				}}
		>{children}</Nav.Link>
	);
}

function changeURLandTitle(url/*, title*/){
	
	window.history.replaceState(
	//window.history.pushState(
		"", //object or string representing the state of the page
		"", //new title //aunque parece que no funciona bien xd
		//"/ViGtory/"+"settings/"+url //new URL
		//( window.location.href.substr(0, window.location.href.lastIndexOf("settings")) ) + "/" + url //new URL

		(BaseName==="/"?"":BaseName)+"/settings/"+url //new URL
	);
	//document.title = "ViGtory! "+"Modifica les teves dades d'usuari"/*+title*/;

	let text = "";
	switch(url){
		/*case "username":
			text = "Modifica el teu nom d'usuari";
			break;*/
		case "password":
			text = "Modifica la teva contrasenya";
			break;
		case "mail":
			text = "Afegeix o modifica un correu electrònic ordinari";
			break;
		case "mail_student":
			text = "Afegeix un correu electrònic d'estudiant";
			break;
		case "degree":
			text = "Canvia el teu grau d'estudis d'interès";
			break;
		/*case "delete_account":
			text = "Elimina el teu compte";
			break;*/
	}
	document.title = "ViGtory! "+text;

}























/*
class UsernameForm extends React.Component {

	constructor(props) {
		super(props);

		this.state = {allValid: false};

		this.user_ref = React.createRef();
		this.user = <UsernameInput form_field_name="settings_username" ref={this.user_ref} validation_rgx_msg={this.props.validation_rgx_msg.username} global_validity_action={() => this.checkLocalValidity()} defaultValue={props.defaultValue} />;

		this.ref_list = [this.user_ref];
	}

	checkLocalValidity(){
		let valid = true;
		for (let i=0; i<this.ref_list.length && valid; i++){
			//valid = this.ref_list[i].current.state.valid && (this.ref_list[i].current.content_txt !== "");
			valid = this.ref_list[i].current.valid && (this.ref_list[i].current.content_txt !== "");
			//console.log(this.ref_list[i].current.content_txt);
		}
		//console.log(this.password_ref.current.pwd_txt);
		this.setState({allValid: valid});
		return valid;
	}

	submitButtonAction(event){
		event.preventDefault();
		if (!this.checkLocalValidity()){
			alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}
		//submitUpdateDataToAPI(event, "signUp", this.props.navigate);

	}



	render(){
		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h3>Modifica el teu nom d'usuari:</h3>
				{this.user}
				<p className="text-center" ><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Canvia nom d'usuari</Button></p>
			</Form>
		);
	};
}
*/


















class PasswordForm extends React.Component {

	constructor(props) {
		super(props);

		this.state = {allValid: false};

		this.main_pwd_txt = "";


		this.password_ref = React.createRef();
		this.password = <PasswordInput pwTconfF={false} oldTnewF={true} ref={this.password_ref} validation_rgx_msg={this.props.validation_rgx_msg.password} main_password_action={(pwd) => this.updateMainPassword(pwd)} global_validity_action={() => this.checkLocalValidity()} />;


		this.newPassword_ref = React.createRef();
		this.newPassword = <PasswordInput pwTconfF={true} oldTnewF={false} ref={this.newPassword_ref} validation_rgx_msg={this.props.validation_rgx_msg.password} main_password_action={(pwd) => this.updateMainPassword(pwd)} global_validity_action={() => this.checkLocalValidity()} />;

		this.confirmPassword_ref = React.createRef();
		this.confirmPassword = <PasswordInput pwTconfF={false} oldTnewF={false} ref={this.confirmPassword_ref} main_password_action={() => this.getMainPassword()} global_validity_action={() => this.checkLocalValidity()} />;

		this.ref_list = [this.password_ref, this.newPassword_ref, this.confirmPassword_ref];
	}

	updateMainPassword(pwd){
		//console.log("UPDATE: "+pwd);
		this.main_pwd_txt =  pwd;
		this.confirmPassword_ref.current.validate_content_clientside();

	}
	getMainPassword(){
		//console.log("GET: "+this.state.main_pwd_txt);
		return this.main_pwd_txt;
	}




	checkLocalValidity(){
		let valid = true;
		for (let i=0; i<this.ref_list.length && valid; i++){
			//valid = this.ref_list[i].current.state.valid && (this.ref_list[i].current.content_txt !== "");
			valid = this.ref_list[i].current.valid && (this.ref_list[i].current.content_txt !== "");
			//console.log(this.ref_list[i].current.content_txt);
		}
		//console.log(this.password_ref.current.pwd_txt);
		this.setState({allValid: valid});
		return valid;
	}

	submitButtonAction(event){
		event.preventDefault();
		if (!this.checkLocalValidity()){
			alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}
		submitUpdateDataToAPI(event, "modificarContrasenya", this.props.navigate);

	}



	render(){

		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h3>Modifica la teva contrasenya:</h3>
				{this.password}
				{this.newPassword}
				{this.confirmPassword}
				<p className="text-center" ><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Estableix nova contrasenya</Button></p>
			</Form>
		);
	};
}


















/*
class MailForm extends React.Component {

	constructor(props) {
		super(props);

		this.state = {allValid: false};
		this.confirmed = this.props.confirmed;
		this.mail_ref = React.createRef();
		this.mail = <MailInput form_field_name="settings_mail" mail_student={this.props.mail_student} ref={this.mail_ref} validation_rgx_msg={this.props.validation_rgx_msg.mail} global_validity_action={() => this.checkLocalValidity()} defaultValue={props.defaultValue} confirmed={this.confirmed} />;

		this.ref_list = [this.mail_ref];
	}

	checkLocalValidity(){
		let valid = true;
		for (let i=0; i<this.ref_list.length && valid; i++){
			//valid = this.ref_list[i].current.state.valid && (this.ref_list[i].current.content_txt !== "");
			valid = this.ref_list[i].current.valid && (this.ref_list[i].current.content_txt !== "");
			//console.log(this.ref_list[i].current.content_txt);
		}
		//console.log(this.password_ref.current.pwd_txt);
		this.setState({allValid: valid});
		return valid;
	}

	submitButtonAction(event){
		event.preventDefault();
		if (this.props.mail_student && this.props.confirmed && (this.props.defaultValue !== "")){
			return; //Para evitar que la gente trastee con el HTML
		}
		if (!this.checkLocalValidity()){
			alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}
		submitUpdateDataToAPI(event, 
			(this.props.mail_student ?
				(this.confirmed ? "" : "afegirSegonCorreu")
				:
				(this.confirmed ? "modificarCorreu" : "afegirSegonCorreu")
			), this.props.navigate);

	}

	//componentDidMount(){ //Esto no sirve
	//	this.checkLocalValidity();
	//	console.log("successfully mounted!!!!!!!!!!");
	//}

	render(){

		console.log(this.props.defaultValue);

		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h3>{this.props.mail_student?"Afegeix un correu electrònic d'estudiant (no es pot modificar):":"Afegeix o modifica un correu electrònic ordinari:"}</h3>
				{this.mail}
				<p className="text-center" ><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Efectua modificació de correu</Button></p>
			</Form>
		);
	};
}*/









class MailForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {allValid: false};
		this.mail_ref = React.createRef();
	}

	initialize(){
		this.confirmed = this.props.confirmed;
		this.mail = <MailInput form_field_name="settings_mail" mail_student={this.props.mail_student} ref={this.mail_ref} validation_rgx_msg={this.props.validation_rgx_msg.mail} global_validity_action={() => this.checkLocalValidity()} defaultValue={this.props.defaultValue} confirmed={this.confirmed} />;

		this.ref_list = [this.mail_ref];
	}

	checkLocalValidity(){
		let valid = true;
		for (let i=0; i<this.ref_list.length && valid; i++){
			//valid = this.ref_list[i].current.state.valid && (this.ref_list[i].current.content_txt !== "");
			valid = this.ref_list[i].current.valid && (this.ref_list[i].current.content_txt !== "");
			//console.log(this.ref_list[i].current.content_txt);
		}
		//console.log(this.password_ref.current.pwd_txt);
		this.setState({allValid: valid});
		return valid;
	}

	submitButtonAction(event){
		event.preventDefault();
		if (this.props.mail_student && this.props.confirmed && (this.props.defaultValue !== "")){
			return; //Para evitar que la gente trastee con el HTML
		}
		if (!this.checkLocalValidity()){
			alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}
		submitUpdateDataToAPI(event, 
			(this.props.mail_student ?
				(this.confirmed ? "" : "afegirSegonCorreu")
				:
				(this.confirmed ? "modificarCorreu" : "afegirSegonCorreu")
			), this.props.navigate);

	}

	/*componentDidMount(){ //Esto no sirve
		this.checkLocalValidity();
		console.log("successfully mounted!!!!!!!!!!");
	}*/

	render(){
		this.initialize();

		console.log(this.props.defaultValue);

		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h3>{this.props.mail_student?"Afegeix un correu electrònic d'estudiant (no es pot modificar):":"Afegeix o modifica un correu electrònic ordinari:"}</h3>
				{this.mail}
				<p className="text-center" ><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Efectua modificació de correu</Button></p>
			</Form>
		);
	};
}

















class DegreeForm extends React.Component {

	constructor(props) {
		super(props);
	}

	

	submitButtonAction(event){
		event.preventDefault();
		/*if (!this.checkLocalValidity()){
			alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}*/
		//console.log("TOT CORRECTE!");
		//console.log(new FormData(event.currentTarget));

		submitUpdateDataToAPI(event, "modificarGrau", this.props.navigate);

	}



	render(){

		//console.log(this.props.defaultValue);

		let degree = <DegreeInput form_field_name="settings_degree" degreeList={this.props.degreeList} defaultValue={this.props.defaultValue} />;

		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h3>Canvia el teu grau d'estudis d'interès:</h3>
				{degree}
				<p className="text-center" ><Button type="submit" className="mt-3 mb-2" >Efectua canvi de grau</Button></p>
			</Form>
		);
	};
}


















/*
class DeleteAccountForm extends React.Component {

	constructor(props) {
		super(props);
	}


	submitButtonAction(event){
		event.preventDefault();
		if (window.confirm("Realment vols eliminar el teu compte de ViGtory?\n\nPrem \"Acceptar\" per a procedir a l'eliminació definitiva del teu compte:")){
			//submitDataToAPI(event, "signUp", this.props.navigate);
		}

	}

	render(){

		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h3>⚠ Elimina el teu compte:</h3>
				<br/>
				<p>
					Eliminar el teu compte suposarà l'eliminació del contingut de totes les teves publicacions i comentaris, així com el teu perfil i els fitxers que hagis pujat a ViGtory.
					<br/><br/>
					Si prems el botó que hi ha a continuació, se't demanarà una confirmació per fer segur que realment vols eliminar el teu compte de ViGtory:
				</p>
				<p className="text-center" ><Button type="submit" className="mt-3 mb-2" variant="danger" >⚠️ Eliminar compte ⚠️</Button></p>
			</Form>
		);
	};
}
*/



















































class SettingsNav extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			activeKey: "accord_"+this.props.currentSection
		};
		changeURLandTitle(this.props.currentSection);
	}



	updateSettingsNav(newKey){
		//console.log("newKey: "+newKey+"   previousStateKey:"+this.state.activeKey);
		if (newKey != this.state.activeKey){
			this.setState({activeKey: newKey});
			return true;
		}
		return false;
	}



			/*

				<ScreenToggle eventKey="accord_username" updateSettingsNav={(newKey) => this.updateSettingsNav(newKey)} >Nom d'usuari</ScreenToggle>

				<ScreenToggle eventKey="accord_delete_account" updateSettingsNav={(newKey) => this.updateSettingsNav(newKey)} >Eliminar compte</ScreenToggle>

			*/



	render(){

		return(

			<>
			<h2 className="settings_navbar m-auto">Configura el teu perfil d'usuari:</h2>

			<Nav 
				fill
				variant="pills"
				activeKey={this.state.activeKey}
				className="settings_navbar m-auto"
			>


				

				<ScreenToggle eventKey="accord_password" updateSettingsNav={(newKey) => this.updateSettingsNav(newKey)} >Contrasenya</ScreenToggle>

				<ScreenToggle eventKey="accord_mail" updateSettingsNav={(newKey) => this.updateSettingsNav(newKey)} >Correu ordinari</ScreenToggle>

				<ScreenToggle eventKey="accord_mail_student" updateSettingsNav={(newKey) => this.updateSettingsNav(newKey)} >Correu d'estudiant</ScreenToggle>

				<ScreenToggle eventKey="accord_degree" updateSettingsNav={(newKey) => this.updateSettingsNav(newKey)} >Grau d'estudis d'interès</ScreenToggle>

				



			</Nav>
			</>


		);
	}

}









class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		//this.userData = props.userData;
		this.userData = {};
		changeURLandTitle(this.props.currentSection);
		//this.updateData = (data)=>{this.userData = data;}
	}




	/*getDegreeList(){

		let degreeList = [
			//"Grau en Àmbit Industrial",
			"Grau en Enginyeria Mecànica",
			"Grau en Enginyeria Elèctrica",
			"Grau en Enginyeria Electrònica Industrial i Automàtica",
			"Grau en Enginyeria Informàtica",
			"Grau en Enginyeria de Disseny Industrial i Desenvolupament del Producte"
		]

		return degreeList;

	}*/

	/*updateDegreeData(data){
		this.degreeList = data;
		this.forceUpdate();
	}
	updateUserData(data){
		this.userData = data;
		//this.userData = {};
		//this.setState(this.state);
		this.forceUpdate();
	}*/
	updateData(DegreeData, UserData){
		this.degreeList = DegreeData.graus;
		this.userData = UserData;
		this.forceUpdate();
	}


	
	render(){
		console.log(this.userData)
		
		let validation_rgx_msg = getValidationRegexAndErrorMessages();
		//let degreeList = this.getDegreeList();
		let degreeList = this.degreeList;


		//<NavBar />
		//onSelect={(eventKey) => ScreenToggle(eventKey)}


		/*
					<Accordion.Collapse eventKey="accord_username" >
						<div>
							<div className="content_wrapper">
							<UsernameForm validation_rgx_msg={validation_rgx_msg} defaultValue={"nomdusuariactual"} navigate={this.props.navigate} />
							</div>
						</div>
					</Accordion.Collapse>




					<Accordion.Collapse eventKey="accord_delete_account" >
						<div>
							<div className="content_wrapper">
							<DeleteAccountForm navigate={this.props.navigate} />
							</div>
						</div>
					</Accordion.Collapse>

		*/



		return(
			<>

			<NavBar />
			<br/><br/><br/><br/>





			<Accordion defaultActiveKey={"accord_"+this.props.currentSection}>

				<SettingsNav currentSection={this.props.currentSection} />
				<br/>

				<div className="content">

					

					<Accordion.Collapse eventKey="accord_password" >
						<div>
							<div className="content_wrapper">
							<PasswordForm validation_rgx_msg={validation_rgx_msg} navigate={this.props.navigate} />
							</div>
						</div>
					</Accordion.Collapse>

					<Accordion.Collapse eventKey="accord_mail" >
						<div>
							<div className="content_wrapper">
							<MailForm validation_rgx_msg={validation_rgx_msg} mail_student={false} defaultValue={this.userData.email} confirmed={this.userData.emailConfirmed} navigate={this.props.navigate} />
							</div>
						</div>
					</Accordion.Collapse>

					<Accordion.Collapse eventKey="accord_mail_student" >
						<div>
							<div className="content_wrapper">
							<MailForm validation_rgx_msg={validation_rgx_msg} mail_student={true} defaultValue={this.userData.emailStudent} confirmed={this.userData.emailStudentConfirmed} navigate={this.props.navigate} />
							</div>
						</div>
					</Accordion.Collapse>

					<Accordion.Collapse eventKey="accord_degree" >
						<div>
							<div className="content_wrapper">
							<DegreeForm degreeList={degreeList} defaultValue={this.userData.grauInteres} navigate={this.props.navigate} />
							</div>
						</div>
					</Accordion.Collapse>

					

				</div>

				
			</Accordion>

			</>
		);

	};
}


function ProfileSettings(props){
	//document.title = "ViGtory! Configura el teu perfil";


	

	//this.ref_list = [this.user_ref, this.password_ref, this.password_confirm_ref, this.mail_ref];



	



	const {section} = useParams();


	

	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}

	let screen_ref = React.createRef();
	//let userData = {};
	//let screen = <InitialScreen currentSection={section} userData={userData} navigate={navigateTo} ref={screen_ref} />;
	let screen = <InitialScreen currentSection={section} navigate={navigateTo} ref={screen_ref} />;
	//let mounted = false;
	//let updateData = (data)=>{userData = data;}

	useEffect(() => {
		//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
		if (!Cookie.get("jwt")){
			navigateTo("/signin");
		}

		/*getDegreeList().then((data) => {
			screen_ref.current.updateDegreeData(data);
		});

		//if ((screen_ref!=null) && (!mounted)){
			getUserData().then((data) => {
				//screen_ref.current.useEffect(()=>{
					screen_ref.current.updateUserData(data);
					//mounted = true;
				//}, []);
				//updateData(data);
			});
		//}*/

		getDegreeList().then((DegreeData) => {
			getUserData().then((UserData) => {
				screen_ref.current.updateData(DegreeData, UserData);
			});

		});

		


	}, []);
	
	


	return(
	<>
		{screen}
	</>
	)
}
export default ProfileSettings;