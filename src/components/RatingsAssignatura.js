import React from 'react';
import { useEffect, useContext } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate, useLocation } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, DropdownButton, useAccordionButton, AccordionContext } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Dropdown, Popover } from 'react-bootstrap';

import ViGtVote from "./ViGtVote";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/RatingsAssignatura.css';

import {Cookie} from '../libraries/cookie';
import {BaseName} from "../libraries/basename";

import Rating from 'react-rating';

















async function votaAssignatura(data, update_votes){
	
	
	

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		API_address + "/assignatura/voteAssignatura", {
			method: "PUT",
			//mode: 'cors',
			body: data,
			headers: headers,
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
				//window.location.reload();
				update_votes();
			}
			
			return response;
		}, 
		resp => { //NO ha sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	/*.then(
		data => {
			//console.log(data);
		}
	);*/
}




async function getVots(sub){
	
	let data = new URLSearchParams();
	data.append("assignaturaId", sub);

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	return promise = await fetch(
		API_address + "/assignatura/getVotesAssignatura"+"?"+data.toString(), {
			method: "GET",
			//body: data,
			headers: headers,
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
			}
			
			return response;
		}, 
		resp => { //NO ha sido posible conectar con la API
			window.alert(err_mssg);
			return;
		}
	)
	/*.then(
		data => {
			//console.log(data);
		}
	);*/
}























































function ScreenToggleRatingsAssignatura({ children, eventKey, isStudent }){
	const { activeEventKey } = useContext(AccordionContext);
	const switchScreen = useAccordionButton(eventKey, null);

	//console.log(eventKey);
	//console.log(activeEventKey);
	
	return(<>

		<Button 
			onClick={switchScreen}
			variant="primary"
			size="md"
			fontWeight="bolder"
			className={"py-0 border-0 new_comment_button mt-1"}
		>
			<b className="d-flex align-items-center">
				<span style={{fontFamily: "monospace", padding:"0"}}>
					{//Ojo, que usamos "–", no "-"; tiene exactamente el mismo ancho que "+"
						((eventKey===activeEventKey)?"–":"+")
					}
				</span>
				&nbsp;
				{isStudent ? "Valora l'assignatura" : "Valoracions de l'assignatura"}
			</b>
		</Button>

	</>);
}
















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);

		this.fields = ["dificultat", "professorat", "interesant", "feina"]

		this.fractions = 1; //Preferiblemente esto debería estar puesto a 1 o a 2; otros valores mejor que no
		this.showVoteButton = true;

		this.userVotes = {
			dificultat: 3,
			professorat: 3,
			interesant: 3,
			feina: 3
		};
		this.allVotes = {
			dificultat: null,
			professorat: null,
			interesant: null,
			feina: null,
			vots: 0
		}

		this.emojiSeq = {
			dificultat: 	["😄","😅","😶","😥","🤯"],
			professorat:	["😭","😟","😶","😃","🥰"],
			interesant: 	["😴","🥱","😶","🤔","😲"],
			feina: 			["🥳","😌","😶","😟","😱"]	//😕
		};
		this.title = {
			dificultat: "Dificultat",
			professorat: "Professorat",
			interesant: "Contingut interessant",
			feina: "Càrrega de treball"
		};
		
		this.hasVoted = false;
		this.isStudent = true;
	}










	load_votes(){

		getVots(this.props.sub).then(data=>{
			console.log(data);
			//if (data.votUsuari && data.votUsuari!=[]){ //NO QUIERE FUNCIONAR ASÍ!!!
				//this.hasVoted = true;
				//this.hasVoted = data.votUsuari.votDificultat ? true : false;
			if (data.votUsuari && !(Array.isArray(data.votUsuari) && data.votUsuari.length==0)){
				this.hasVoted = true;
				this.showVoteButton = false;
				this.userVotes = {
					dificultat: data.votUsuari.votDificultat,
					professorat: data.votUsuari.votProfessorat,
					interesant: data.votUsuari.votInteresant,
					feina: data.votUsuari.votFeina
					/*
					dificultat: data.votUsuari.votDificultat ? data.votUsuari.votDificultat : this.userVotes.dificultat,
					professorat: data.votUsuari.votProfessorat ? data.votUsuari.votProfessorat : this.userVotes.professorat,
					interesant: data.votUsuari.votInteresant ? data.votUsuari.votInteresant : this.userVotes.interesant,
					feina: data.votUsuari.votFeina ? data.votUsuari.votFeina : this.userVotes.feina
					*/
				};
			}
			this.allVotes = {
				dificultat: data.dificultat,
				professorat: data.professorat,
				interesant: data.interesant,
				feina: data.feina,
				vots: data.vots
			}

			//console.log(this.userVotes);
			this.forceUpdate();
		})
	}



	mapIconlist(field, fullFnofullT){return this.emojiSeq[field].map((v,k) => <>
			
			<span className={"rating-icon"+(fullFnofullT?" rating-icon-full":"")}>
				{v}
			</span>


			<p className="text-center my-0 ms-1 text-nowrap">
				{fullFnofullT?
				<span 
					className="label label-default label-onrate position-relative" 
					id={"label-onrate-"+field+"-"+(k+1)}/>
				:<>&nbsp;</>}
			</p>

			
			
			</>
		);
	}



	render_rating(field){
		let promig = parseFloat(this.allVotes[field]?this.allVotes[field]:0).toFixed(2);
		//console.log(promig);
		//console.log(Math.ceil(parseFloat(promig)+0.00000001)-1);
		//total_vots = 27;
		
		//https://reactjsexample.com/a-rating-react-component-with-custom-symbols/
		return <>
				<p className={"text-center" + ((this.allVotes.vots > 0) ? " mb-0" : " mb-3")} >
				<h5 className="fw-bold mb-0">{this.title[field]+":"}</h5>
				<Rating 
					fractions={this.fractions}
					emptySymbol={this.mapIconlist(field, false)}
					fullSymbol={this.mapIconlist(field, true)}
					onHover={(rate) => {
						//console.log(rate);
						Array.from(window.document.getElementsByClassName('label-onrate')).map((el) => {
							el.innerHTML = "&nbsp";
						});
						if (Math.ceil(rate))
						window.document.getElementById('label-onrate-'+field+"-"+(Math.ceil(rate))).innerHTML = rate || "&nbsp";
						}}
					initialRating={this.isStudent ? (this.userVotes[field]) : Math.trunc(promig)}
					readonly={!this.isStudent}
					onChange={(e)=>{
						this.userVotes[field] = e;
						if (this.isStudent && !this.showVoteButton) this.submitAction();
						}}
				/>
				</p>
				{(this.allVotes.vots > 0) ? 
					<p className="text-center mb-5 mt-0">
						{this.hasVoted ? <>
							(el teu vot: {this.emojiSeq[field][this.userVotes[field]-1]+this.userVotes[field]})
							<br/>
						</>:""}
						<span className="text-decoration-underline">
							Promig: <b>{(this.emojiSeq[field][Math.trunc(promig)-1])+promig}</b>/5
						</span>
					</p>
				: ""}
			

			</>
		;
	}



	submitAction(){
		//console.log(this.userVotes);

		let data = new URLSearchParams();
		data.append("assignaturaId", this.props.sub);

		Object.keys(this.userVotes).forEach((key)=>{
			//console.log('Key : ' + key + ', Value : ' + data[key])
			data.append( ("vot"+(key[0].toUpperCase())+(key.substring(1))), this.userVotes[key]);
		})
		//console.log(data.toString());

		votaAssignatura(data, ()=>{this.load_votes()});
	}

	submitButtonAction(event){
		event.preventDefault();
		this.submitAction();
	}


	
	render(){

		return(
			<>
				<Accordion className="m-0 mb-2" defaultActiveKey={''/*"accord_ratings_assig_"+this.props.sub*/}>
					<p className="text-center" style={{marginBottom: "-0.5rem", zIndex: "6", position: "relative"}} >
						<ScreenToggleRatingsAssignatura eventKey={"accord_ratings_assig_"+this.props.sub} isStudent={this.isStudent} />
					</p>

					<Accordion.Collapse eventKey={"accord_ratings_assig_"+this.props.sub} style={{zIndex: "5", position: "relative"}}><div>
						<Card className={"mx-auto sub_vote"} >
							<Card.Body className="py-1 px-1">


								{(this.isStudent) ?
									<p className="text-center mb-2 mt-2">
										{this.hasVoted ? 
											"Ja has votat aquí, però pots canviar el teu vot!"
										: 
										<>
											{"Encara no has votat a "+this.props.sub+"..."}
											<br/>
											{"Vota ara!"}
										</>
										}
									</p>
								:""}

								<p className="text-center mb-4 mt-3">
									{this.allVotes.vots ? 
									(
										(this.allVotes.vots==1) ?
											<>Pel moment només ha votat <b>1</b> alumne!</>
										:
											<><b>{this.allVotes.vots}</b> alumnes han votat:</>
									)
									:
									<><b>Cap</b> alumne ha votat encara!</>
									}
								</p>

									{this.fields.map(v=>this.render_rating(v))}

								{(this.isStudent && this.showVoteButton) ?
									<p className="text-center mb-3 mt-2">
										<Button 
											className="fw-bold"
											onClick={(e)=>this.submitButtonAction(e)}
										>
										VOTA!
										</Button>
									</p>
								:""}
								

							</Card.Body>
						</Card>
					</div></Accordion.Collapse>
				</Accordion>

				<br/>
			</>
		);

	};
}




















function RatingsAssignatura(props){

	
	const location =  useLocation();
	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}

	let ratingAssig_ref = React.createRef();
	useEffect(() => {
		ratingAssig_ref.current.load_votes();
	}, []);




	return(
		<InitialScreen sub={props.sub} ref={ratingAssig_ref} />
	)
}
export default RatingsAssignatura;