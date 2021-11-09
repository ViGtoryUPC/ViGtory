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




























































function TextInput({field_name, form_field_name}){
//class TextInput extends React.Component {
	//render(){
	//return(<div>text{children}</div>);
	//};

	return(

		<InputGroup>
			<InputGroup.Text>
				{field_name}
			</InputGroup.Text>
			<FormControl type="text" name={form_field_name} placeholder="usuari" defaultValue=""></FormControl>
		</InputGroup>

	);
}













function validate_content_regex(event, validations){
	//Comprobamos errores de formato con Regex
	let content = event.currentTarget.value;
	console.log(content);

	for (let i = 0; i < validations.length; i++) {
		//console.log(Object.keys(validations[i])[0]);

		let regex = Object.keys(validations[i])[0];
		//console.log(regex.slice(1, -1));
		//console.log( new RegExp(regex.slice(1, -1)).test(content) );

		if (! ( new RegExp(regex.slice(1, -1)).test(content) ) ){
			return validations[i][regex] + "hola";
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

		//Comprobamos errores de formato con Regex
		let regex_val_err_msg = validate_content_regex(event, this.props.validation_rgx_msg);
		if (regex_val_err_msg != false){
			this.setState({
				valid: false,
				//err_msg: validations[i][regex]
				err_msg: regex_val_err_msg
			});
			console.log("err_msg: " + this.state.err_msg);
			return;
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

			<Form.Floating className="sm mt-2 mb-3">
				<FormControl
					type="text" 
					name={"username"} 
					placeholder="Nom d'usuari" 
					defaultValue=""
					onChange={this.validate_content_clientside.bind(this)}
					required
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
	render(){
		//Contraseña normal
		if (this.props.form_field_name.split("_").length < 3){
			console.log(this.props.validation_rgx_msg[0]);
		}
		//Confirmar contraseña
		else {

		}
		return(<TextInput field_name="Contrasenya" form_field_name="password"/>);
	};
}

class MailInput extends React.Component {
	render(){
		console.log(this.props.validation_rgx_msg[0]);
		return(<TextInput field_name="Correu electrònic" form_field_name="mail"/>);
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
			<div>
				<h1>Inicia sessió:</h1>
				{user}
				{password}

				<p>
					No tens un compte?&nbsp;
					<ScreenToggleLoginRegister eventKey="accord_register">Crea'n un!</ScreenToggleLoginRegister>
				</p>
			</div>
		);
	};
}

class RegisterForm extends React.Component {
	render(){
		return(
			<div>
				<h1>Crea un nou compte:</h1>
				<UsernameInput form_field_name="register_username" validation_rgx_msg={this.props.validation_rgx_msg.username} />
				<PasswordInput form_field_name="register_password"  validation_rgx_msg={this.props.validation_rgx_msg.password} />
				<PasswordInput form_field_name="register_password_confirm" />
				<MailInput form_field_name="register_mail" validation_rgx_msg={this.props.validation_rgx_msg.mail} />
				<DegreeInput  form_field_name="register_degree" />
				<p>
					Ja tens un compte?&nbsp;
					<ScreenToggleLoginRegister eventKey="accord_login">Accedeix-hi aquí!</ScreenToggleLoginRegister>
				</p>
			</div>
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
				{"/^.{2,32}$/" : "El teu nom d'usuari només pot ocupar 2-32 caràcters."},
				{"/^[a-zA-Z0-9_\\-\\.]+$/" : "El teu nom d'usuari només pot contenir caràcters [a-z, A-Z, 0-9, _, -, .]."}
			],
			"password" : [
				{"/^.{4,32}$/" : "La teva contrasenya només pot ocupar 4-32 caràcters."},
				{"/^[a-zA-Z0-9_\\-\\.]+$/" : "La teva contrasenya només pot contenir caràcters [a-z, A-Z, 0-9, _, -, .]."}
			],
			"mail" : [
				{"/^.+@.+$/" : "És necessària una adreça electrònica vàlida.\nPer exemple: usuari@domini.xyz"}
			]

		};

		//Como lo pasaremos como prop, no hace falta hacer JSON.stringify()
		return validation_rgx_msg;
	}




	
	render(){
		
		let validation_rgx_msg = this.getValidationRegexAndErrorMessages();

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
					<RegisterForm validation_rgx_msg={validation_rgx_msg} />
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
