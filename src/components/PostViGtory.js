import React from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Dropdown, Popover } from 'react-bootstrap';


import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/PostViGtory.css';

import '../libraries/cookie';

import NoUpvote_img from '../assets/images/NoUpvote.png';
import Upvote_img from '../assets/images/Upvote.png';
import NoDownvote_img from '../assets/images/NoDownvote.png';
import Downvote_img from '../assets/images/Downvote.png';








class UpvoteDownvoteButton extends React.Component{

	//https://stackoverflow.com/questions/44604966/how-to-click-an-image-and-make-a-rotation //En otra ocasión

	constructor(props) {
		super(props);
		this.state = {
			voted: props.voted
		};
	}


	updateVoteSelf(voted){
		this.setState({ 
			voted: voted //Aquí debería haber el valor que diga la API, para que no haya bugs
		})
	}



	voteAction(){
		//Enviar voto a la API y hacer el setState que toque

		let voted = !this.state.voted;


		this.updateVoteSelf(voted);
		this.props.updateVote(this.props.upTdownF, voted);

	}


	render() {
		const { voted } = this.state;
		const upTdownF = this.props.upTdownF;
	
		return (
			<img
				src={
					voted
					? (upTdownF ? Upvote_img : Downvote_img)
					: (upTdownF ? NoUpvote_img : NoDownvote_img)
				}
				onClick={this.voteAction.bind(this)}
				className="d-inline votearrow mt-0 mb-1"
			/>
		);
	}

}















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			upvoted: props.post_info.post_upvoted,
			downvoted: props.post_info.post_downvoted,
			vote_count: props.post_info.post_upvotes-props.post_info.post_downvotes
		};

		this.upvote_button_ref = React.createRef();
		this.upvote_button = <UpvoteDownvoteButton upTdownF={true} voted={this.props.post_info.post_upvoted} updateVote={(upTdownF, voted) => this.updateVote(upTdownF, voted)} ref={this.upvote_button_ref} />;
		
		this.downvote_button_ref = React.createRef();
		this.downvote_button = <UpvoteDownvoteButton upTdownF={false} voted={this.props.post_info.post_downvoted} updateVote={(upTdownF, voted) => this.updateVote(upTdownF, voted)} ref={this.downvote_button_ref} />;
		

	}

	updateVoteCount(alteration){
		this.setState(
			{vote_count: this.props.post_info.post_upvotes-this.props.post_info.post_downvotes
				+(this.props.post_info.post_upvoted?(-1):(this.props.post_info.post_downvoted?(+1):0))
				+alteration
			}
		);
	}

	updateVote(upTdownF, voted){
		//console.log(upTdownF +" "+ voted);

		if (voted){
			if (upTdownF){
				if (this.downvote_button_ref.current.state.voted){
					this.downvote_button_ref.current.updateVoteSelf(false);
				}
			}
			else{
				if (this.upvote_button_ref.current.state.voted){
					this.upvote_button_ref.current.updateVoteSelf(false);
				}
			}
		}

		this.updateVoteCount( ( (upTdownF && voted) ? (1) : ( ((!upTdownF) && voted) ? (-1) : 0 ) ) );
	}



	//<UpvoteDownvoteButton voted={this.props.post_info.post_upvoted}/>
	//<UpvoteDownvoteButton voted={this.props.post_info.post_downvoted}/>
	render(){
		
		//<Card.Title>Card Title</Card.Title>
		//<Card.Subtitle className="mb-2 text-muted">Card Subtitle</Card.Subtitle>
		//<Popover><Popover.Body>
		//<Card.Link href="#">Card Link</Card.Link>
		//Link a perfil de usuario
		return(
			<>
				

				<Card className="mx-auto mb-4" >
					<Card.Body>

						
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
								{this.props.post_info.post_date.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ", a les " + this.props.post_info.post_date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
								</Tooltip>
							}
							><p className="text-muted float-end my-0"><small>
								{this.props.post_info.post_date.toLocaleDateString('ca-ES', { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' })}
							</small></p>
						</OverlayTrigger>
						<br/>
					
					
						<div className="mt-2 mb-3">
							<Card.Title className="d-inline">

							<Link to={"/user/"+this.props.post_info.user_name} className="text-reset text-decoration-none">
								{false ? <img src="aaa" className="user_access_icon d-inline" /> : <></>}
								{this.props.post_info.user_name}
							</Link>
								


							</Card.Title>
							<Card.Subtitle className="text-muted d-inline">{" diu:"}</Card.Subtitle>
						</div>

						

						<Card.Text>
							{this.props.post_info.post_content}
						</Card.Text>



						<div className="d-inline">

							{this.upvote_button}

							<h5 className="d-inline"><strong>
								{(this.state.vote_count).toString()}
							</strong></h5>

							{this.downvote_button}

						</div>

						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<Card.Link className="d-inline align-items-middle text-reset text-decoration-none" href="#"><strong>
							{this.props.post_info.post_comment_count}{" Comentari"}{this.props.post_info.post_comment_count==1 ? "":"s"}
						</strong></Card.Link>

						
						{this.props.post_info.post_files.length > 0 ?
						
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip className="tooltip_fitxers"><ol className="mt-1 mb-1">
									{this.props.post_info.post_files.map((filename, i, namelist) => {return (
										<li>
											{filename}
											{i<namelist.length-1 ? <Dropdown.Divider className="mt-1 mb-1" /> : ""}
										</li>
									);})}
									</ol></Tooltip>
								}
								><p className="float-end mt-1 mb-0">
									{this.props.post_info.post_files.length}{" Fitxer"}{this.props.post_info.post_files.length==1 ? "":"s"}
								</p>
							</OverlayTrigger>
						
						: ""}




						

					</Card.Body>
				</Card>
					
				

			</>
		);

	};
}






function PostViGtory(props){
	return(
		<InitialScreen post_info={props.post_info} />
	)
}
export default PostViGtory;