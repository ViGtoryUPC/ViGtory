import React from 'react';
import { Accordion, Button, Card, InputGroup, Form, FormControl } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


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
	}


	validate_content_clientside(event){

		let content = event.currentTarget.value;

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
				//console.log("err_msg: " + this.state.err_msg);
				return;
			}
			
		}

		//Si todo es correcto
		this.setState({
			valid: true,
			err_msg: ""
		});
	}


	render(){
		//console.log(this.props.validation_rgx_msg[0]);
		//return(<TextInput field_name="Nom d'usuari" form_field_name="username"/>);

		return(

			<Form.Floating className="mt-3">
				<Form.Control
					type="text" 
					name={"username"} 
					placeholder="usuari" 
					defaultValue=""
					onChange={this.validate_content_clientside.bind(this)}
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
		this.pwd_txt = "";
	}

	getPasswordText(){
		return this.state.password_txt;
	}

	validate_content_clientside(){


		let password_txt = this.pwd_txt; //event.currentTarget.value;
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
					onChange={(e) => {this.pwd_txt=e.currentTarget.value; this.validate_content_clientside();}}
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
				return;
			}

		}

		//Si todo es correcto
		this.setState({
			valid: true,
			err_msg: ""
		});
	}


	render(){

		return(

			<Form.Floating className="mt-3">
				<Form.Control
					type="email" 
					name={"email"} 
					placeholder="usuari@domini.xyz" 
					defaultValue=""
					onChange={this.validate_content_clientside.bind(this)}
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
		return(<Form.Select field_name="Grau d'estudis" form_field_name="degree"/>);
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


class LoginForm extends React.Component {
	
	render(){
		/*let User = new UsernameInput();
		User.props.form_field_name="login_username";
		User.props.validation_rgx_msg=this.props.validation_rgx_msg.username;*/

		let user = <UsernameInput form_field_name="login_username" validation_rgx_msg={this.props.validation_rgx_msg.username} />;
		//console.log(user.props.form_field_name);

		let password = <PasswordInput form_field_name="login_password" validation_rgx_msg={this.props.validation_rgx_msg.password} />;

		return(
			<Form noValidate method="post" action="http://httpbin.org/post">
				<h1>Inicia sessió:</h1>
				{user}
				{password}
				<p><Button type="submit" className="mt-3 mb-2">Accedeix</Button></p>
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
		this.main_pwd_txt = "";
		this.password = <PasswordInput form_field_name="register_password"  validation_rgx_msg={this.props.validation_rgx_msg.password} main_password_action={(pwd) => this.updateMainPassword(pwd)} />;

		this.childRef = React.createRef();
		this.confirmPassword = <PasswordInput form_field_name="register_password_confirm" ref={this.childRef} main_password_action={() => this.getMainPassword()} />
	}

	updateMainPassword(pwd){
		//console.log("UPDATE: "+pwd);
		this.main_pwd_txt =  pwd;
		this.childRef.current.validate_content_clientside();
	}
	getMainPassword(){
		//console.log("GET: "+this.state.main_pwd_txt);
		return this.main_pwd_txt;
	}


	render(){

		let user = <UsernameInput form_field_name="register_username" validation_rgx_msg={this.props.validation_rgx_msg.username} />;
		//console.log(user.props.form_field_name);

		

		let mail = <MailInput form_field_name="register_mail" validation_rgx_msg={this.props.validation_rgx_msg.mail} />;

		let degree = <DegreeInput form_field_name="register_degree" degreeList={this.props.degreeList} />;

		return(
			<Form noValidate method="post" action="http://httpbin.org/post">
				<h1>Crea un nou compte:</h1>
				{user}
				{this.password}
				{this.confirmPassword}
				{mail}
				{degree}
				<p><Button type="submit" className="mt-3 mb-2">Crea compte</Button></p>
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
			<div>
			<Accordion defaultActiveKey="accord_login" className="content">

				<Accordion.Collapse eventKey="accord_login" >
					<div className="content_wrapper">
					<LoginForm validation_rgx_msg={validation_rgx_msg} />
					</div>
				</Accordion.Collapse>

				<Accordion.Collapse eventKey="accord_register">
					<div className="content_wrapper">
					<RegisterForm validation_rgx_msg={validation_rgx_msg} degreeList={degreeList} />
					</div>
				</Accordion.Collapse>

			</Accordion>
			</div>
		);

	};
}






// ========================================

ReactDOM.render(
	<InitialScreen />,
	document.getElementById('root')
);
