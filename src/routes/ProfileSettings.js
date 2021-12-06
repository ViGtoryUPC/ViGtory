import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
import PropTypes from 'prop-types';
//import ReactDOM from 'react-dom';
//import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

import { Accordion, Button, Container, Form, FloatingLabel } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/ProfileSettings.css';

import { Cookie } from '../libraries/cookie';


//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);







async function getUserDataFromAPI(){
	
	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let userData = {};
	
	let headers = new Headers();
	headers.append("authorization", Cookie.get("jwt"));
	//console.log(headers.get("authorization"));
	

	let promise = await fetch(
		(API_address + "/user/getInfoUsuari"), {
			method: "GET",
			mode: 'cors',
			//body: new URLSearchParams(),
			headers: headers,
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API
			//Si no es correcto (status !200-299)
			if (!resp.ok){
				window.alert(resp.statusText);
				return;
			}
			return resp.json();;
		}, 
		resp => { //NO sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	.then(
		data => {
			if (data === undefined) return;
			userData = data;
		}
	);
	console.log(userData);

	return userData;
}
























async function submitDataToAPI(event, route, navigate){
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


	
	if (route === "signUp"){
		if (! window.confirm("Podràs modificar aquestes dades més endavant des de la configuració del teu perfil.\n\nTingues en compte, però, que NO hi podràs accedir al teu perfil fins que no hagis verificat la teva adreça de correu electrònic.\n\nEls usuaris amb una adreça ******@estudiantat.upc.edu tindran accés a funcionalitats que els usuaris amb un correu ordinari no, però tindràs la possibilitat d'afegir qualsevol dels dos tipus d'adreces a la configuració del teu perfil.\n\nEstàs d'acord?")){
			return;
		}
	}






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
				if (route === "signUp"){
					//Mostramos un alert al user y le llevamos a Login
					window.alert("S'ha enviat un missatge amb un enllaç de verificació a l'adreça de correu electrònic que has introduït.\n\nRecorda que no podràs iniciar sessió fins a haver verificat el teu compte.\n\nComprova la carpeta d'spam del teu gestor de correus en cas que sigui necessari.");
					navigate("/signin");
				}
			}
			else{
				window.alert(resp.statusText);
				return;
			}
			
			return response;
		}, 
		resp => { //NO sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	.then(
		data => {
			if (data === undefined) return;

			if (route === "signIn"){
				//Logeamos al user y le llevamos a Home
				Cookie.set("jwt", data.jwt, 30);
				console.log(Cookie.get("jwt"));
				//navigate("/", { replace: true }) //Para evitar que un usuario que se acaba de loguear vuelva a la pantalla de Login //POR ALGÚN MOTIVO NO FUNCIONA
				
				window.history.replaceState(
					"", //object or string representing the state of the page
					"", //new title //aunque parece que no funciona bien xd
					"/" //new URL
				);
				navigate("/");
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
		//return(<TextInput field_name="Nom d'usuari" form_field_name="username"/>);

		return(

			<Form.Floating className="mt-3">
					{/*onChange={this.validate_content_clientside.bind(this)}*/}
				<Form.Control
					type="text" 
					name={"username"} 
					placeholder="usuari" 
					defaultValue=""
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










class PasswordInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			valid: true,
			err_msg: "",
			pwTconfF: (props.form_field_name.split("_").length < 3),
			logTregF: (props.form_field_name.split("_")[0] === "login")
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
		let logTregF = this.state.logTregF;

		if ( (password_txt.length) > 0 && (!this.state.logTregF) ){
			//Si es un campo de contraseña original
			if (pwTconfF){

				if (!logTregF){
					//Si estamos en el formulario de registro, actualizamos la contraseña común para la confirmación
					this.props.main_password_action(password_txt);
				}
				
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
			logTregF: logTregF
		});
		this.valid = valid;
	}



	render(){
		let pwTconfF = this.state.pwTconfF;
		//Contraseña normal
		if (this.props.form_field_name.split("_").length < 3){
			//console.log(this.props.validation_rgx_msg[0]);
		}
		//Confirmar contraseña
		else {

		}
		//return(<TextInput field_name="Contrasenya" form_field_name="password"/>);
		return(

			<Form.Floating className={"mt-"+(pwTconfF ? "3":"1")+" mb-"+(pwTconfF ? "1":"3")}>
				<Form.Control
					type="password" 
					name={(pwTconfF ? "p" : "confirmP")+"assword"} 
					placeholder="contrasenya" 
					defaultValue=""
					onChange={(e) => {this.content_txt=e.currentTarget.value; this.validate_content_clientside(); this.props.global_validity_action();}}
					required 
					isInvalid={!this.state.valid}
				/>
				<Form.Control.Feedback type="invalid">
					{this.state.err_msg}
				</Form.Control.Feedback>
				<label htmlFor="floatingInputCustom">{pwTconfF ? "Contrasenya" : "Confirmar contrasenya"}</label>
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

		}

		//Si todo es correcto
		this.setState({
			valid: true,
			err_msg: ""
		});
		this.valid = true;
	}


	render(){

		return(

			<Form.Floating className="mt-3">
				<Form.Control
					type="email" 
					name={"email"} 
					placeholder="usuari@domini.xyz" 
					defaultValue=""
					onChange={(e) => {this.content_txt=e.currentTarget.value; this.validate_content_clientside(e); this.props.global_validity_action();}}
					required 
					isInvalid={!this.state.valid}
				/>
				<Form.Control.Feedback type="invalid">
					{this.state.err_msg}
				</Form.Control.Feedback>
				<label htmlFor="floatingInputCustom">Correu electrònic</label>

			</Form.Floating>

		);
	};
}






class DegreeInput extends React.Component {
	render(){
		//return(<Form.Select field_name="Grau d'estudis" form_field_name="degree"/>);
		
		return(

			<FloatingLabel className="mt-3 mb-2" label="Grau d'estudis d'interès">
				<Form.Select name={"degree"} aria-label="Floating label select example">

					{this.props.degreeList.map((deg_name, i) => { return (
						<option value={i} key={i}>{deg_name}</option>
					)})}

				</Form.Select>
			</FloatingLabel>

		);
	};
}















function ScreenToggle({ children, eventKey }){
	const switchScreen = useAccordionButton(eventKey, ()=>{
		//console.log("Accordion "+eventKey+" triggered!")
		//changeURLandTitle(eventKey.split("_")[1] === "login")
	});
	
	return(


		<Nav.Link 
			eventKey="/" 
			className="d-flex justify-content-center align-items-center" 
			className="interactiveToggle"
			onClick={switchScreen}
		>{children}</Nav.Link>

	);
}

function changeURLandTitle(url, title){
	
	window.history.replaceState(
		"", //object or string representing the state of the page
		"", //new title //aunque parece que no funciona bien xd
		"/"+"settings"/*+url*/ //new URL
	);
	document.title = "ViGtory! "+title;

}



























class LoginForm extends React.Component {
	
	constructor(props) {
		super(props);

		this.state = {allValid: false};

		this.user_ref = React.createRef();
		this.user = <UsernameInput form_field_name="login_username" ref={this.user_ref} validation_rgx_msg={this.props.validation_rgx_msg.username} global_validity_action={() => this.checkLocalValidity()} />;

		this.password_ref = React.createRef();
		this.password = <PasswordInput form_field_name="login_password" ref={this.password_ref} validation_rgx_msg={this.props.validation_rgx_msg.password} main_password_action={(pwd) => this.updateMainPassword(pwd)} global_validity_action={() => this.checkLocalValidity()} />;


		this.ref_list = [this.user_ref, this.password_ref];
	}



	checkLocalValidity(){
		let valid = true;
		for (let i=0; i<this.ref_list.length && valid; i++){
			valid = this.ref_list[i].current.valid && (this.ref_list[i].current.content_txt !== "");
		}
		this.setState({allValid: valid});
		return valid;
	}

	submitButtonAction(event){
		event.preventDefault();
		if (!this.checkLocalValidity()){
			alert("Tots els camps han de ser omplerts correctament.");
		}
		//console.log("TOT CORRECTE!");

		submitDataToAPI(event, "signIn");
	}




	render(){
		/*let User = new UsernameInput();
		User.props.form_field_name="login_username";
		User.props.validation_rgx_msg=this.props.validation_rgx_msg.username;*/


		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h1>Inicia sessió:</h1>
				{this.user}
				{this.password}
				<p className="text-center"><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Accedeix</Button></p>
				{/*<p className="mt-3 mb-4">
					Has oblidat la teva contrasenya?&nbsp;
					<ScreenToggle eventKey="accord_register">Clica aquí!</ScreenToggle>
				</p>*/}
				<p className="text-center mt-1 mb-1">
					No tens un compte?&nbsp;
					<ScreenToggle eventKey="accord_register">Crea'n un!</ScreenToggle>
				</p>
			</Form>
		);
	};
}

class RegisterForm extends React.Component {

	constructor(props) {
		super(props);

		this.state = {allValid: false};

		this.main_pwd_txt = "";

		this.user_ref = React.createRef();
		this.user = <UsernameInput form_field_name="register_username" ref={this.user_ref} validation_rgx_msg={this.props.validation_rgx_msg.username} global_validity_action={() => this.checkLocalValidity()} />;

		this.password_ref = React.createRef();
		this.password = <PasswordInput form_field_name="register_password" ref={this.password_ref} validation_rgx_msg={this.props.validation_rgx_msg.password} main_password_action={(pwd) => this.updateMainPassword(pwd)} global_validity_action={() => this.checkLocalValidity()} />;

		this.password_confirm_ref = React.createRef();
		this.confirmPassword = <PasswordInput form_field_name="register_password_confirm" ref={this.password_confirm_ref} main_password_action={() => this.getMainPassword()} global_validity_action={() => this.checkLocalValidity()} />;

		this.mail_ref = React.createRef();
		this.mail = <MailInput form_field_name="register_mail" ref={this.mail_ref} validation_rgx_msg={this.props.validation_rgx_msg.mail} global_validity_action={() => this.checkLocalValidity()} />;

		this.ref_list = [this.user_ref, this.password_ref, this.password_confirm_ref, this.mail_ref];
	}

	updateMainPassword(pwd){
		//console.log("UPDATE: "+pwd);
		this.main_pwd_txt =  pwd;
		this.password_confirm_ref.current.validate_content_clientside();

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
		}
		//console.log("TOT CORRECTE!");

		submitDataToAPI(event, "signUp");

	}



	render(){


		let degree = <DegreeInput form_field_name="register_degree" degreeList={this.props.degreeList} />;

		return(
			<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >
				<h1>Crea un nou compte:</h1>
				{this.user}
				{this.password}
				{this.confirmPassword}
				{this.mail}
				{degree}
				{/*<p><Button type="submit" className="mt-3 mb-2">Crea compte</Button></p>*/}
				<p className="text-center" ><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Crea compte</Button></p>
				<p className="text-center">
					Ja tens un compte?&nbsp;
					<ScreenToggle eventKey="accord_login">Accedeix-hi aquí!</ScreenToggle>
				</p>
			</Form>
		);
	};
}







class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
		changeURLandTitle(this.props.loginTregisterF);
		
	}

	LoginOrRegisterClick() {
		changeURLandTitle(!this.state.loginTregisterF);
		this.setState({
			loginTregisterF: !this.state.loginTregisterF
		})
	}

	



	getValidationRegexAndErrorMessages(){

		//Uso de los regex: regex.test(string); //(pero el regex es idetificado por las barras, y no puede ser un string)
		//Para poder usar el string regex a modo de objeto regex, hará falta usar RegExp y slice:
		//(new RegExp("/^.+@.+$/".slice(1, -1)).test("hola@gmail.com"));

		let validation_rgx_msg = 
		{
			"username" : [
				{"/^.{2,32}$/" : "El teu nom d'usuari només pot ocupar 2-32 caràcters."},
				{"/^[a-zA-Z0-9_\\-\\.]+$/" : "El teu nom d'usuari només pot contenir caràcters [a-z, A-Z, 0-9, _, -, .]."}
			],
			"password" : [
				{"/^.{8,32}$/" : "La teva contrasenya només pot ocupar 8-32 caràcters."},
				{"/^[a-zA-Z0-9_\\-\\.]+$/" : "La teva contrasenya només pot contenir caràcters [a-z, A-Z, 0-9, _, -, .]."},
				{"/(?=.*[a-z])/" : "La teva contrasenya ha de contenir almenys 1 lletra minúscula (a-z)."},
				{"/(?=.*[A-Z])/" : "La teva contrasenya ha de contenir almenys 1 lletra majúscula (A-Z)."},
				{"/(?=.*[0-9])/" : "La teva contrasenya ha de contenir almenys 1 nombre (0-9)."}
			],
			"mail" : [
				{"/^.+@.+\\..+$/" : "És necessària una adreça electrònica vàlida.\nPer exemple: usuari@domini.xyz"}
			]

		};

		//Como lo pasaremos como prop, no hace falta hacer JSON.stringify()
		return validation_rgx_msg;
	}

	getDegreeList(){

		let degreeList = [
			"Grau en Àmbit Industrial",
			"Grau en Enginyeria Mecànica",
			"Grau en Enginyeria Elèctrica",
			"Grau en Enginyeria Electrònica Industrial i Automàtica",
			"Grau en Enginyeria Informàtica",
			"Grau en Enginyeria de Disseny Industrial i Desenvolupament del Producte"
		]

		return degreeList;

	}




	
	render(){
		
		let validation_rgx_msg = this.getValidationRegexAndErrorMessages();
		let degreeList = this.getDegreeList();
		
		//<NavBar />

		return(
			<>

			<NavBar />
			<br/><br/><br/><br/>





			
			<Navbar className="settings_navbar m-auto" >
			<Nav 
				fill
				variant="pills"
				activeKey={this.props.currentSection}
				className="m-auto my-3 my-md-0"
				onSelect={(eventKey) => ScreenToggle(eventKey)}
			>

				<ScreenToggle eventKey="accord_login">Nom d'usuari</ScreenToggle>

				<Nav.Item>
					<Nav.Link eventKey="/" className="d-flex justify-content-center align-items-center" >
						Contrasenya
					</Nav.Link>
				</Nav.Item>

				<Nav.Item>
				<Nav.Link eventKey="/grade_calc" className="d-flex justify-content-center align-items-center" >Correu ordinari</Nav.Link>
				</Nav.Item>

				<Nav.Item><Nav.Link eventKey="/schedule_gen" className="d-flex justify-content-center align-items-center" >Correu d'estudiant</Nav.Link></Nav.Item>

				<Nav.Item><Nav.Link eventKey="/schedule_gen" className="d-flex justify-content-center align-items-center" >Grau d'estudis d'interès</Nav.Link></Nav.Item>

			</Nav>
						</Navbar>



















			<Accordion defaultActiveKey={"settings_username"} className="content">


				<Accordion.Collapse eventKey="accord_register" >
					<div>
						<div className="content_wrapper">
						<RegisterForm validation_rgx_msg={validation_rgx_msg} degreeList={degreeList} />
						</div>
						<br/><br/><br/><br/><br/><br/><br/><br/><br/>
					</div>
				</Accordion.Collapse>

				<Accordion.Collapse eventKey="settings_username" >
					<div>
						<div className="content_wrapper">
						<LoginForm validation_rgx_msg={validation_rgx_msg} />
						</div>
						<br/><br/><br/><br/><br/><br/>
					</div>
				</Accordion.Collapse>

				
			</Accordion>

			</>
		);

	};
}


function ProfileSettings(props){
	//document.title = "ViGtory! Configura el teu perfil";


	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}
	useEffect(() => {
		if (!Cookie.get("jwt")){
			navigateTo("/signin");
		}
	  }, []);




	//let userData = getUserDataFromAPI();






	return(
		<InitialScreen />
	)
}
export default ProfileSettings;