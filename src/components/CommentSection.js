import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate, useLocation } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, DropdownButton } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Dropdown, Popover } from 'react-bootstrap';

import ViGtVote from "./ViGtVote";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/CommentSection.css';

import {Cookie} from '../libraries/cookie';
import {BaseName} from "../libraries/basename";















async function deleteComentari(comment_id, hideComment){
	
	let data = new URLSearchParams();
	data.append("comentariId", comment_id);

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		API_address + "/comentari/deleteComentari", {
			method: "DELETE", //en la docu todavía sale como POST, ojo cuidao'
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
				hideComment();
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



async function newComentari(post_id, text, parent_id){
	
	let data = new URLSearchParams();
	data.append("idAportacio", post_id);
	data.append("body", text);

	if (parent_id)
		data.append("idParent", parent_id);

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		API_address + "/comentari/newComentari", {
			method: "POST",
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
				window.location.reload();
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




async function getComentaris(post_id){
	
	let data = new URLSearchParams();
	data.append("idAportacio", post_id);

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	return promise = await fetch(
		API_address + "/comentari/getComentaris"+"?"+data.toString(), {
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
















function newParamsOrdre(params, new_o, new_c){
	//Recibimos un objeto URLSearchParams y devolvemos una copia con los parámetros ord y cri cambiados
	//ordre; //-1; //( 1=Ascendent | -1=Descendent )
	//criteri; //1; //( 0=Data | 1=Vots )

	let params_ = new URLSearchParams(params.toString());
	params_.set("ord", new_o.toString());
	params_.set("cri", new_c.toString());

	return params_;
}


class OrdreDropdown extends React.Component {

	constructor(props) {
		super(props);
		this.hasBeenUsed = false;

		this.valid_ordres = [-1, 1];
		this.valid_criteris = [0, 1];

		let params = new URLSearchParams(window.location.search);
		this.current_ordre = this.valid_ordres.includes(parseInt(params.get("ord")))?parseInt(params.get("ord")):-1;
		this.current_criteri = this.valid_criteris.includes(parseInt(params.get("cri")))?parseInt(params.get("cri")):1;
		this.updateURL();
	}

	updateURL(){
		let new_params = newParamsOrdre(new URLSearchParams(window.location.search), this.current_ordre, this.current_criteri);
		window.history.replaceState(
			"", "",
			(BaseName==="/"?"":BaseName) + this.props.location.pathname + "?" + new_params.toString() //new URL
		);
	}


	updateSelected(selected){
		selected = JSON.parse(selected);
		//console.log(selected);
		this.hasBeenUsed = true;
		this.current_ordre = parseInt(selected["ordre"]);
		this.current_criteri = parseInt(selected["criteri"]);

		this.updateURL();

		this.props.reoder_comments();
		this.forceUpdate();
	}

	ordreJSON(ordre, criteri){
		return {"ordre": ordre, "criteri": criteri};
	}
	getJSONtext(json){
		//data["ordre"] = -1; //( 1=Ascendent | -1=Descendent )
		//data["criteri"] = 1; //( 0=Data | 1=Vots )
		let text = "Ordre: ";
		if (json["criteri"] == 1){
			text += (json["ordre"]==1 ? "Pitjor" : "Millor") + " valorats"
		}
		else{
			/*if (json["criteri"] == 0){
				text += "Data";
			}
			text += " "+(json["ordre"]==1 ? "ascendent" : "descendent");*/
			if (json["criteri"] == 0){
				text += "Més " + (json["ordre"]==1 ? "antics" : "recents")
			}
		}

		return text;
	}
	

	render(){
		let params = new URLSearchParams(window.location.search);

		this.current_ordre = this.hasBeenUsed ? this.current_ordre : ( this.current_ordre ? this.current_ordre : (params.has("ord") ? params.get("ord") : -1));

		this.current_criteri = this.hasBeenUsed ? this.current_criteri : ( this.current_criteri ? this.current_criteri : (params.has("cri") ? params.get("cri") : 1));



		return(<>

			<DropdownButton
				align="end"
				key={"dropdownbutton"}
				variant="outline-primary"
				size="sm"
				title={this.getJSONtext(this.ordreJSON(this.current_ordre, this.current_criteri))}
				onSelect={(e)=>{this.updateSelected(e)}}
			>
				
				{ this.valid_criteris.map((v_c, k_c) => { 
					return this.valid_ordres.map((v_o, k_o) => { 
					let json = this.ordreJSON(v_o, v_c);
					//console.log(this.getJSONtext(json));
					return (
						<>
						<Dropdown.Divider className="my-0" key={k_c+"_"+k_o+"_"} />
						<Dropdown.Item key={k_c+"_"+k_o}
							eventKey={JSON.stringify(json)}
							className={(this.current_ordre===v_o && this.current_criteri===v_c)?"current_selection":""}
						>
							{this.getJSONtext(json)}
						</Dropdown.Item>
						</>
					)

				} )
				} ) }

			</DropdownButton>

		</>);
	}

}
























/*
class IndividualComment extends React.Component {

	constructor(props) {
		super(props);
		this.depth = props.depth ? props.depth : 0;
		this.showPost = true;
	}

	updateVoteCount(alteration){
		this.setState(
			{vote_count: this.props.post_info.votes
				-(this.props.post_info.votUsuari ? this.props.post_info.votUsuari : 0)
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


	hidePost(){
		this.showPost = false;
		this.forceUpdate();
	}


	render(){
		
		if (!this.showPost) return(<></>);


		let date = new Date(this.props.post_info.createdAt);
		let file_list = this.props.post_info.fitxers ? this.props.post_info.fitxers : [];



		return(
			<>
			<div className={"post mx-auto"+(this.props.individualView?" mb-0 individual":" mb-4")}>
				
				


				<Card className={"mx-auto"+(this.props.individualView?" mb-0":" mb-4")} >



					


					<Card.Body className="pb-1" 
						onClick={(e)=>{
							if(e.target===e.currentTarget){
								this.props.navigate("/post/"+this.props.post_info._id);
								//console.log(e.currentTarget.parentNode) //Por si me da por hacer que se pueda abrir en pestaña nueva con click derecho, rueda de ratón, etc
							}
						}}
						onMouseOver={(e)=>{
							//console.log(e.target)
							if(e.target===e.currentTarget){
								e.currentTarget.style.cursor = "pointer";
							}
							else {
								e.currentTarget.style.cursor = e.target.style.cursor;
								e.currentTarget.parentNode.style.cursor = e.target.style.cursor;
								}
						}}
						>






						{this.props.post_info.sigles_ud ?
							<Link to={"/?p=1&sub="+this.props.post_info.sigles_ud} className="text-reset text-decoration-none">
								<Button size="sm" className="sigles_ud_nav py-0" 
								style={{
									"--bttn_color":stringToColor(this.props.post_info.sigles_ud, 40),
									"--bttn_color_hover":stringToColor(this.props.post_info.sigles_ud, 35),
									border:"none"
									}}
								>
									<b>{this.props.post_info.sigles_ud}</b>
								</Button>
							</Link>

							:""
						}
						






						












						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
								{date.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ", a les " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
								</Tooltip>
							}
							><p className="text-muted float-end my-0"><small>
								{date.toLocaleDateString('ca-ES', { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' })}
							</small></p>
						</OverlayTrigger>
						<br/>
					





						{(Cookie.get("username")===this.props.post_info.userName)?
						<DropdownButton
							align="end"
							key={"dropdownbutton"}
							variant="light"
							size="md"
							title={"⋮"}
							className="float-end d-inline"
						>


							<Dropdown.Item 
								size="sm"
								key={"edit_"+this.props.post_info._id}
								onClick={()=>{
									console.log("EDITA EDITA EDITA");
								}}
							>
								{"✏️Edita"}
							</Dropdown.Item>



							<Dropdown.Item 
								size="sm"
								key={"del_"+this.props.post_info._id}
								className="delete_post_btn"
								onClick={()=>{
									if (window.confirm("Realment vols eliminar aquesta aportació?\n\nTítol:\n    «"+this.props.post_info.title+"»")){
										deletePost(
											this.props.post_info._id,
											this.props.individualView,
											this.props.post_info.sigles_ud,
											() => {this.hidePost()})
									}
								}}
							>
								{"❌Elimina"}
							</Dropdown.Item>



						</DropdownButton>
						:""}






					
						<div className="mt-1 mb-1" style={{width:"fit-content"}}>
							<Card.Subtitle className="text-muted d-inline">
								<Link to={"/user/"+this.props.post_info.userName} className="text-reset text-decoration-none username_nav px-2">
									{false ? <img src="aaa" className="user_access_icon d-inline" /> : <></>}
									<b>{this.props.post_info.userName}</b>
								</Link>
							</Card.Subtitle>
								{"diu:"}
							<br/>
						</div>










						








						
						<div className="mt-1 mb-2"><Link to={"/post/"+this.props.post_info._id} className="text-reset text-decoration-none">
							<Card.Title className="d-inline">
								<b>{this.props.post_info.title}</b>
							</Card.Title>
						</Link>
						</div>


						<Card.Text>
								{this.props.post_info.body}
						</Card.Text>



						<ViGtVote post_id={this.props.post_info._id} comment_id={null} votUsuari={this.props.post_info.votUsuari} voteCount={this.props.post_info.votes}/>

						&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
						<Link to={"/post/"+this.props.post_info._id} className="d-inline align-items-middle text-reset text-decoration-none"><strong>
							{this.props.post_info.post_comment_count?this.props.post_info.post_comment_count:"0"}{" Comentari"}{this.props.post_info.post_comment_count==1 ? "":"s"}
						</strong></Link>

						
						{((file_list.length > 0) && (!this.props.individualView)) ?
						
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip className="tooltip_fitxers"><ol className="mt-1 mb-1">
									{file_list.map((filename, i, namelist) => {return (
										<li>
											{filename}
											{i<namelist.length-1 ? <Dropdown.Divider className="mt-1 mb-1" /> : ""}
										</li>
									);})}
									</ol></Tooltip>
								}
								>
								
								<p className="float-end mt-1 mb-0">
								<Link to={"/post/"+this.props.post_info._id} className="d-inline align-items-middle text-reset text-decoration-none">
									{file_list.length}{" Fitxer"}{file_list.length==1 ? "":"s"}
								</Link>
								</p>
							</OverlayTrigger>
						
						: ""}


						

					</Card.Body>


				</Card>



			</div>
			</>
		);

	};
}
*/



class IndividualComment extends React.Component {

	constructor(props) {
		super(props);
		this.depth = props.depth ? props.depth : 0;
		this.showPost = true;
	}

	render(){
		return(<>comment of depth {this.depth}</>);
	}

}


















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);

		this.comment_tree = {replies: []};
		//this.current_ordre = props.current_ordre;
		//this.current_criteri = props.current_criteri;
		this.ordcriDrop_ref = React.createRef();

	}





	orderJSONlistBy(json_list, prop, ascdesc){
		//return json_list;
		if (!json_list) return [];
		//let prop = "sigles_ud";
		return json_list.sort(
			(a, b) => {
				if (a[prop] > b[prop]) {return 1*ascdesc;}
				else if (a[prop] < b[prop]) {return -1*ascdesc;}
				return 0;
			}
		);
	}

	orderCommentsRecursively(tree, prop, ascdesc){
		this.orderJSONlistBy(tree.replies, prop, ascdesc);
		for (let i=0; i<tree.replies.length; i++){
			this.orderCommentsRecursively(tree.replies[i], prop, ascdesc);
		}
	}


	placeCommentInTree(comment, tree, depth){
		if (comment.hasOwnProperty("parent")){
			for (let i=0; i<tree.replies.length; i++){
				if (tree.replies[i]._id == comment.parent){
					comment["depth"] = depth+1;
					comment["replies"] = [];
					tree.replies[i].replies.push(comment);
					return;
				}
			}
			for (let i=0; i<tree.replies.length; i++){
				this.placeCommentInTree(comment, tree.replies[i], depth+1);
			}
		}
		else{
			comment["depth"] = depth;
			comment["replies"] = [];
			tree.replies.push(comment);
			return;
		}
	}


	renderLinearizedTree(tree){
		
		return (tree.replies).map((comment, k) => {
			return (
				<>
					{"__".repeat(comment.depth)}
					{comment.body}
					{comment.createdAt}
					<br/><br/>
					<>{
						this.renderLinearizedTree(comment)
					}</>
				</>
			);
		} );


	}




	reoder_comments(){
		this.comment_tree = {replies: []};

		let params = new URLSearchParams(window.location.search);

		let ord = params.has("ord") ? params.get("ord") : -1; //ordre; //-1; //( 1=Ascendent | -1=Descendent )
		let cri = params.has("cri") ? params.get("cri") : 1;  //criteri; //1; //( 0=Data | 1=Vots )

		let base_tree = {replies: []}; //ord=-1;cri=0
		getComentaris(this.props.post_id).then(data=>{
			//console.log(data);
			for (let i=0; i<data.comentaris.length; i++){
				//console.log(data.comentaris[i].body);
				console.log(data.comentaris[i].createdAt);
				this.placeCommentInTree(data.comentaris[i], base_tree, 0);
			}

			if (ord==1 && cri==0){
				this.comment_tree = base_tree;
				//console.log("unchanged")
			}
			else {
				let criteri = cri==0 ? "createdAt" : "votes";
				this.orderCommentsRecursively(base_tree, criteri, ord);
				this.comment_tree = base_tree;
			}
			//console.log(base_tree);
			//for (let i=0; i<base_tree.replies.length; i++){
			//	console.log(base_tree.replies[i].createdAt);
			//}

			this.forceUpdate();

		})
	}



	
	render(){
		

		return(
			<>
			<div className={"commentsection mx-auto mb-0 mt-3"}>
			
				<div className="my_dropdown_selector ordre_dropdown">
					<OrdreDropdown current_ordre={this.props.current_ordre} current_criteri={this.props.current_criteri} reoder_comments={() => {this.reoder_comments();}} ref={this.ordcriDrop_ref} location={this.props.location} />
				</div>










				<Card className={"commentlist mx-auto mb-0 w-100"} >
					<Card.Body className="pb-1">



					
















					{
						(this.comment_tree.replies.length > 0) ?
						<>


							{this.renderLinearizedTree(this.comment_tree)}



						</>:<>



							<p className="text-center">
								<br/>
								No hi ha cap comentari que mostrar aquí.
								<br/><br/>
								Sigues la primera persona a comentar!
								<br/><br/>
							</p>



						</>
					}






					


						

					</Card.Body>
				</Card>
			</div>
			</>
		);

	};
}




















function CommentSection(props){

	
	const location =  useLocation();
	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}

	let commentSection_ref = React.createRef();
	useEffect(() => {
		commentSection_ref.current.reoder_comments();
	}, []);




	return(
		<InitialScreen post_id={props.post_id} location={location} ref={commentSection_ref} />
	)
}
export default CommentSection;