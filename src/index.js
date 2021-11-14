import React from 'react';
import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './libraries/cookie'
import logo_ViGtory from './assets/images/ViGtory_logo_alt.png';

/*
function Square(props) {
	return (
		<button className="square" onClick={props.onClick}>
			{props.value}
		</button>
	);
}

	
class Board extends React.Component {

	renderSquare(i) {
		return (
			<Square
				value={this.props.squares[i]}
				onClick={() => this.props.onClick(i)}
			/>
		);
	}



	renderBoard() {
		const dimensions = [...Array(3).keys()];

		return(
			dimensions.map(i => {return(

				<div className="board-row">

				{dimensions.map(j => {return(
					this.renderSquare(i*dimensions.length+j)
				)})}

				</div>

			)})
		);

	}



	render() {
		return (
			<div>
				<div className="status">{this.status}</div>
				{this.renderBoard()}
			</div>
		);
	}
}

class Game extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			history: [{
				squares: Array(9).fill(null),
			}],
			stepNumber: 0,
			xIsNext: true
		};
	}



	handleClick(i){
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.squares.slice();
		if (calculateWinner(squares) || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({
			history: history.concat([{
				squares: squares,
			}]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		});
	}


	jumpTo(step) {
		this.setState({
		  stepNumber: step,
		  xIsNext: (step % 2) === 0,
		});
	  }



	render() {

		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current.squares);



		const moves = history.map((step, move) => {
			const desc = move ?
				 ((move === history.length-1) ? 'Go to current move' : ('Go to move #' + move)) :
				'Go to game start';
			return (
				<li key={move}>
					<button onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});



		let status;
		if (winner) {
			status = 'Winner: ' + winner;
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}

		return (
			<div className="game">
				<div className="game-board">
				<Board
					squares={current.squares}
					onClick={(i) => this.handleClick(i)}
				/>
				</div>
				<div className="game-info">
					<div>{status}</div>
					<ol>{moves}</ol>
				</div>
			</div>
		);
	}
}



function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}
*/
































































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

		if (content.length > 0){

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

		if (password_txt.length > 0){
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















function ScreenToggleLoginRegister({ children, eventKey }){
	const switchScreen = useAccordionButton(eventKey, ()=>{/*console.log("Accordion "+eventKey+" triggered!")*/});
	
	return(
		<span 
			className="interactiveToggleLoginRegister"
			onClick={switchScreen}
		>
			{children}
		</span>
	);
}









async function fetchWithTimeout(resource, options = {}) {
	const { timeout = 8000 } = options;
	
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);
	const response = await fetch(resource, {
	  ...options,
	  signal: controller.signal  
	});
	clearTimeout(id);
	return response;
  }





async function submitDataToAPI(event, route){
	//console.log(event.currentTarget.action);
	//event.currentTarget.submit();
		//event.currentTarget.action = "http://vigtory.ddnsfree.com:27017/user/" + route;
	//console.log(event.currentTarget.action);
	//event.currentTarget.submit();

	const data = new URLSearchParams();
	for (const pair of new FormData(event.currentTarget)) {
		data.append(pair[0], pair[1]);
	}
	console.log("DATA===============\n\n"+data+"\n\n==================");


	

	//https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch
	//https://dmitripavlutin.com/javascript-fetch-async-await/
	//https://dmitripavlutin.com/timeout-fetch-request/
	

	let response = "";
	try {
		response /*const promise*/ = await fetchWithTimeout(
			event.currentTarget.action, 
			{
				method: "GET",
				body: data,
				timeout: 5000
			}
		);
		//response = await promise.json();
	} catch (error) {
		if (error.name === 'AbortError'){
			alert("En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.");
		}
		else {console.log(response.statusText);}
		//return;
	}

	//Si todo es correcto (200-299) logeamos al user y le llevamos a Home
	if (response.ok){
		console.log(response.status+" OK")


		return;
	}
	//Si ha habido algún otro error.....
	alert(response.statusText);


	//HACE FALTA ACABAR DE ARREGLAR LOS STATUS TEXT!!!!!!!!
	console.log("HACE FALTA ACABAR DE ARREGLAR LOS STATUS TEXT Y DEMÁS!!!!!!!!");
	console.log("https://stackoverflow.com/questions/41956465/how-to-create-multiple-page-app-using-react ???????????? https://stackoverflow.com/questions/37295377/how-to-navigate-from-one-page-to-another-in-react-js  ????????????????????????????? React Router vs el clásico window.open ???????")



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
				<p><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Accedeix</Button></p>
				{/*<p className="mt-3 mb-4">
					Has oblidat la teva contrasenya?&nbsp;
					<ScreenToggleLoginRegister eventKey="accord_register">Clica aquí!</ScreenToggleLoginRegister>
				</p>*/}
				<p className="mt-1 mb-1">
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
				<p><Button type="submit" className="mt-3 mb-2" disabled={!this.state.allValid}>Crea compte</Button></p>
				<p>
					Ja tens un compte?&nbsp;
					<ScreenToggleLoginRegister eventKey="accord_login">Accedeix-hi aquí!</ScreenToggleLoginRegister>
				</p>
			</Form>
		);
	};
}





class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			//loginTregisterF: this.props.loginTregisterF
			loginTregisterF: true
		};
		
	}

	LoginOrRegisterClick() {
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
				{"/^.{4,32}$/" : "El teu nom d'usuari només pot ocupar 4-32 caràcters."},
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

		return(
			<>

			<a href={window.location.href}>
				<img id="app_title_image" src={logo_ViGtory} className="mx-auto d-block mb-3" alt="ViGtory: Our history, your victory!" />
			</a>

			<Accordion defaultActiveKey="accord_login" className="content">


				<Accordion.Collapse eventKey="accord_register" >
					<div>
					<div className="content_wrapper">
					<RegisterForm validation_rgx_msg={validation_rgx_msg} degreeList={degreeList} />
					</div>
					<br/><br/><br/><br/><br/><br/><br/><br/><br/>
					</div>
				</Accordion.Collapse>

				<Accordion.Collapse eventKey="accord_login" >
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






// ========================================

ReactDOM.render(
	<InitialScreen />,
	document.getElementById('root')
);
