import React from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Dropdown, Popover } from 'react-bootstrap';


import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/ViGtVote.css';

import {Cookie} from '../libraries/cookie';

import NoUpvote_img from '../assets/images/NoUpvote.png';
import Upvote_img from '../assets/images/Upvote.png';
import NoDownvote_img from '../assets/images/NoDownvote.png';
import Downvote_img from '../assets/images/Downvote.png';









async function performVote(vote, post_id, comment_id, expected, definitiveVoteAction){

	const data = new URLSearchParams();

	if (comment_id)
		data.append('comentariId', comment_id);

	data.append('aportacioId', post_id);
	data.append('vote', vote);

	//console.log(comment_id, post_id, vote);


	let route = comment_id ? "/comentari/voteComentari" : "/aportacio/voteAportacio"


	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";


	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	//headers.append("Content-Type", "multipart/form-data");
	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		API_address + route, {
			method: "PUT",
			//mode: 'cors',
			headers: headers,
			body: data,
			redirect: 'follow',
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
	.then(
		data => {
			console.log(data.vot);
			//console.log(data);

			if (data === undefined) return;
			
			if (!resp_ok){
				window.alert(data.error);
				return;
			}

			//if (data.vot != expected)
				definitiveVoteAction(parseInt(data.vot));
		}
	);


}





















class UpvoteDownvoteButton extends React.Component{

	//https://stackoverflow.com/questions/44604966/how-to-click-an-image-and-make-a-rotation //En otra ocasión

	constructor(props) {
		super(props);
		/*this.state = {
			voted: props.voted
		};*/
		this.voted = props.voted;
	}


	updateVoteSelf(voted){
		/*this.setState({ 
			voted: voted
		})*/
		this.voted = voted;
		this.forceUpdate();
	}

	voteAction(voted){
		//Enviar voto a la API y hacer el setState que toque
		this.updateVoteSelf(voted);
		this.props.updateVote(this.props.upTdownF, voted);
	}


	render() {
		//const { voted } = this.state;
		const upTdownF = this.props.upTdownF;
		let vote = !this.voted;

		return (
			<img
				src={
					this.voted
					? (upTdownF ? Upvote_img : Downvote_img)
					: (upTdownF ? NoUpvote_img : NoDownvote_img)
				}
				onClick={() => {
					this.voteAction(vote);
					performVote(
						//(this.props.upTdownF?(vote?1:0):(vote?-1:0)),
						(this.props.upTdownF?1:-1),
						this.props.post_id,
						this.props.comment_id,
						((vote===false)?0:(this.props.upTdownF?1:-1)),
						this.props.definitiveVote)
					}}
				className="d-inline votearrow mt-0 mb-2"
			/>
		);
	}

}








class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			voted: props.votUsuari ? props.votUsuari : 0,
			vote_count: props.voteCount
		};

		this.upvote_button_ref = React.createRef();
		this.upvote_button = <UpvoteDownvoteButton upTdownF={true} voted={this.props.votUsuari===1} updateVote={(upTdownF, voted) => this.updateVote(upTdownF, voted)} ref={this.upvote_button_ref} definitiveVote={(v)=>this.definitiveVote(v)} post_id={this.props.post_id} comment_id={this.props.comment_id} />;
		
		this.downvote_button_ref = React.createRef();
		this.downvote_button = <UpvoteDownvoteButton upTdownF={false} voted={this.props.votUsuari===-1} updateVote={(upTdownF, voted) => this.updateVote(upTdownF, voted)} ref={this.downvote_button_ref} definitiveVote={(v)=>this.definitiveVote(v)} post_id={this.props.post_id} comment_id={this.props.comment_id} />;
		

	}

	updateVoteCount(alteration){
		this.setState(
			{vote_count: this.props.voteCount
				-(this.props.votUsuari ? this.props.votUsuari : 0)
				+alteration
			}
		);
	}

	updateVote(upTdownF, voted){
		//console.log(upTdownF +" "+ voted);

		if (voted){
			if (upTdownF){
				if (this.downvote_button_ref.current.voted){
					this.downvote_button_ref.current.updateVoteSelf(false);
				}
			}
			else{
				if (this.upvote_button_ref.current.voted){
					this.upvote_button_ref.current.updateVoteSelf(false);
				}
			}
		}

		this.updateVoteCount( ( (upTdownF && voted) ? (1) : ( ((!upTdownF) && voted) ? (-1) : 0 ) ) );
	}



	definitiveVote(vote){
		if (vote == 0){
			//this.updateVote(true, false);
			//this.updateVote(false, false);
			if (this.upvote_button_ref.current.voted){
				this.upvote_button_ref.current.updateVoteSelf(false);
			}
			if (this.downvote_button_ref.current.voted){
				this.downvote_button_ref.current.updateVoteSelf(false);
			}
		}
		else if (vote == 1){
			//this.updateVote(true, true);
			//this.updateVote(false, false);
			if (!this.upvote_button_ref.current.voted){
				this.upvote_button_ref.current.updateVoteSelf(true);
			}
			if (this.downvote_button_ref.current.voted){
				this.downvote_button_ref.current.updateVoteSelf(false);
			}
		}
		else if (vote == -1){
			//this.updateVote(true, false);
			//this.updateVote(false, true);
			if (this.upvote_button_ref.current.voted){
				this.upvote_button_ref.current.updateVoteSelf(false);
			}
			if (!this.downvote_button_ref.current.voted){
				this.downvote_button_ref.current.updateVoteSelf(true);
			}
		}

		this.updateVoteCount(vote);
	}


	render(){
		
		

		return(
			<div className="d-inline">

				{this.upvote_button}

				<h5 className="d-inline"><strong>
					{(this.state.vote_count).toString()}
				</strong></h5>

				{this.downvote_button}

			</div>
		);

	};
}






function ViGtVote(props){
	return(
		<InitialScreen post_id={props.post_id} comment_id={props.comment_id} votUsuari={props.votUsuari} voteCount={props.voteCount} />
	)
}
export default ViGtVote;