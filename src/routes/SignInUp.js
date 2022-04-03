import React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import {getDegreeList, getValidationRegexAndErrorMessages} from '../libraries/data_request';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/SignInUp.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";

import logo_ViGtory from '../assets/images/ViGtory_logo_alt.png';

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);















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
				<Form.Select name={"degree"}>

					{/*this.props.degreeList.map((deg_name, i) => { return (
						<option value={i} key={i}>{deg_name}</option>
					)})*/
					this.props.degreeList.map((deg) => { return (
						<option value={deg.codi_programa} key={deg.codi_programa}>{deg.nom}</option>
					)})
					}

				</Form.Select>
			</FloatingLabel>

		);
	};
}















function ScreenToggleLoginRegister({ children, eventKey }){
	const switchScreen = useAccordionButton(eventKey, ()=>{
		//console.log("Accordion "+eventKey+" triggered!")
		changeURLandTitle(eventKey.split("_")[1] === "login")
	});
	
	return(
		<span 
			className="interactiveToggleLoginRegister"
			onClick={switchScreen}
		>
			{children}
		</span>
	);
}

function changeURLandTitle(loginTregisterF){
	//https://stackoverflow.com/questions/4089178/how-to-change-the-url-displayed-in-the-browser-without-leaving-the-page
	//window.history.popS;
	//window.history.pushState(
	window.history.replaceState(
		"", //object or string representing the state of the page
		"", //new title //aunque parece que no funciona bien xd
		//"/ViGtory/"+(loginTregisterF ? "signin" : "signup") //new URL
		//( window.location.href.substr(0, window.location.href.lastIndexOf("/")+1) ) + (loginTregisterF ? "signin" : "signup") //new URL
		
		(BaseName==="/"?"":BaseName)+"/"+(loginTregisterF ? "signin" : "signup") //new URL
	);
	document.title = "ViGtory! "+(loginTregisterF ? "Inicia sessió" : "Crea un nou compte");
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
	//return;

	
	if (route === "signUp"){
		/*if (! window.confirm("Podràs modificar aquestes dades més endavant des de la configuració del teu perfil.\n\nTingues en compte, però, que NO hi podràs accedir al teu perfil fins que no hagis verificat la teva adreça de correu electrònic.\n\nEls usuaris amb una adreça ******@estudiantat.upc.edu tindran accés a funcionalitats que els usuaris amb un correu ordinari no, però tindràs la possibilitat d'afegir qualsevol dels dos tipus d'adreces a la configuració del teu perfil.\n\nEstàs d'acord?")){
			return;
		}*/
		if (! window.confirm("Podràs modificar aquestes dades més endavant des de la configuració del teu perfil, a excepció del teu nom d'usuari.\n\nTingues en compte que NO hi podràs accedir al teu perfil fins que no hagis verificat la teva adreça de correu electrònic.\n\nEls usuaris amb una adreça de correu ******@estudiantat.upc.edu tindran accés a funcionalitats que els usuaris amb un correu ordinari no, però tindràs la possibilitat d'afegir qualsevol dels dos tipus d'adreces a la configuració del teu perfil.\n\nUna vegada confirmada una adreça ******@estudiantat.upc.edu, aquesta no serà modificable.\n\n\nEstàs d'acord?")){
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
			resp_ok = resp.ok;
			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
				if (route === "signUp"){
					//Mostramos un alert al user y le llevamos a Login
					window.alert("S'ha enviat un missatge amb un enllaç de verificació a l'adreça de correu electrònic que has introduït.\n\nRecorda que no podràs iniciar sessió fins a haver verificat el teu compte.\n\nComprova la carpeta d'spam del teu gestor de correus en cas que sigui necessari.");
					navigate("/signin");
				}
			}
			/*else{
				if (route === "signIn"){
					window.alert("No s'ha pogut iniciar sessió.\nComprova que les teves credencials siguin correctes.");
				}
				else if (route === "signUp"){
					window.alert(resp.statusText);
				}
				return;
			}*/
			
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

			if (!resp_ok){
				window.alert(data.error);
				return;
			}

			if (route === "signIn"){
				//Logeamos al user y le llevamos a Home
				Cookie.set("jwt", data.jwt, 30);
				Cookie.set("username", data.usuari, 30);
				//console.log(Cookie.get("jwt"));
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
			window.alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}
		//console.log("TOT CORRECTE!");

		submitDataToAPI(event, "signIn", this.props.navigate);
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
					<ScreenToggleLoginRegister eventKey="accord_register">Clica aquí!</ScreenToggleLoginRegister>
				</p>*/}
				<p className="text-center mt-1 mb-1">
					No tens un compte?&nbsp;
					<ScreenToggleLoginRegister eventKey="accord_register">Crea'n un!</ScreenToggleLoginRegister>
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
			window.alert("Tots els camps han de ser omplerts correctament.");
			return; //Para evitar que la gente trastee con el HTML
		}
		//console.log("TOT CORRECTE!");

		submitDataToAPI(event, "signUp", this.props.navigate);

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
					<ScreenToggleLoginRegister eventKey="accord_login">Accedeix-hi aquí!</ScreenToggleLoginRegister>
				</p>
			</Form>
		);
	};
}







class InitialScreen extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			loginTregisterF: this.props.loginTregisterF
			//loginTregisterF: true
		};
		changeURLandTitle(this.props.loginTregisterF);
		this.degreeList = [];
		
	}

	LoginOrRegisterClick(){
		changeURLandTitle(!this.state.loginTregisterF);
		this.setState({
			loginTregisterF: !this.state.loginTregisterF
		})
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


	updateData(data){
		this.degreeList = data.graus;
		this.forceUpdate();
	}


	
	render(){
		
		//let validation_rgx_msg = this.getValidationRegexAndErrorMessages();
		let validation_rgx_msg = getValidationRegexAndErrorMessages();
		//let degreeList = this.getDegreeList();
		//let degreeList = getDegreeList();
		let degreeList = this.degreeList;
		
		return(
			<>

			<a href={window.location.href}>
				<img id="app_title_image" src={logo_ViGtory} className="mx-auto d-block mb-3" alt="ViGtory: Our history, your victory!" />
			</a>

			<Accordion defaultActiveKey={(this.props.loginTregisterF ? "accord_login" : "accord_register")} className="content">


				<Accordion.Collapse eventKey="accord_register" >
					<div>
					<div className="content_wrapper">
					<RegisterForm validation_rgx_msg={validation_rgx_msg} degreeList={degreeList} navigate={this.props.navigate} />
					</div>
					<br/><br/><br/><br/><br/><br/><br/><br/><br/>
					</div>
				</Accordion.Collapse>

				<Accordion.Collapse eventKey="accord_login" >
					<div>
					<div className="content_wrapper">
					<LoginForm validation_rgx_msg={validation_rgx_msg} navigate={this.props.navigate} />
					</div>
					<br/><br/><br/><br/><br/><br/>
					</div>
				</Accordion.Collapse>

				
			</Accordion>

			</>
		);

	};
}
InitialScreen.propTypes ={
	loginTregisterF: PropTypes.bool.isRequired
}


function SignInUP(loginTregisterF){

	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}



	let screen_ref = React.createRef();
	let screen = <InitialScreen loginTregisterF={loginTregisterF.loginTregisterF} navigate={navigateTo} ref={screen_ref}/>;
	useEffect(() => {
		getDegreeList().then((data) => {
			screen_ref.current.updateData(data);
		});
	}, []);




	return(
	<>
		{screen}
	</>
	)
}
export default SignInUP;