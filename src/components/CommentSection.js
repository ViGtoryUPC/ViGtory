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

























class IndividualComment extends React.Component {

	constructor(props) {
		super(props);
		this.depth = props.comm_info.depth ? props.comm_info.depth : 0;
		this.showComment = true;
	}



	hideComment(){
		this.showComment = false;
		this.forceUpdate();
	}


	render(){
		
		if (!this.showComment) return(<></>);


		let date = new Date(this.props.comm_info.createdAt);



		return(
			<>
			<div className="d-flex mx-1">

			{Array.apply(null, Array(this.depth)).map(()=>{
				return(
					<div className="d-inline flex-grow ms-2" style={{backgroundColor:"rgba(0,127,191,0.4)", color:"rgba(0,0,0,0)"}} >{"."}</div>
				);
			})}
			

			<div id={"comment_"+this.props.comm_info._id} className={"post mb-0 mt-2 flex-fill "} style={{maxWidth:"100%"}}>
			{
				//overflow-hidden impide que los comentarios se salgan de la card, pero también impide visualizar correctamente el dropdown... PARECE que con maxWidth se soluciona
			}

				<div className={"mx-auto mb-0 p-1"} style={{backgroundColor:"rgba(0,127,191,0.1)", borderRadius:"0.5rem"}} >

					<div className="pb-0" >


						<div className="mt-1 mb-1 ms-0 d-inline" style={{width:"fit-content"}}>
							<strong className="text-muted d-inline">
								<Link to={"/user/"+this.props.comm_info.userName} className="text-reset text-decoration-none username_nav px-1">
									{false ? <img src="aaa" className="user_access_icon d-inline" /> : <></>}
									<b>{this.props.comm_info.userName}</b>
								</Link>
							</strong>
							<span className="text-muted">
								{this.depth>0 ? "respon:" : "diu:"}
							</span>
						</div>



						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip>
								{date.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ", a les " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
								</Tooltip>
							}
							><p className="text-muted float-end my-0"><small>
								{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString('ca-ES', {year: '2-digit', month: 'numeric', day: 'numeric' })}
							</small></p>
						</OverlayTrigger>


						<br/>

						{(Cookie.get("username")===this.props.comm_info.userName)?
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
								key={"edit_"+this.props.comm_info._id}
								onClick={()=>{
									console.log("EDITA EDITA EDITA");
								}}
							>
								{"✏️Edita"}
							</Dropdown.Item>



							<Dropdown.Item 
								size="sm"
								key={"del_"+this.props.comm_info._id}
								className="delete_post_btn"
								onClick={()=>{
									if (window.confirm("Realment vols eliminar aquesta aportació?\n\nTítol:\n    «"+this.props.comm_info.title+"»")){
										deleteComentari(
											this.props.comm_info._id,
											this.props.individualView,
											this.props.comm_info.sigles_ud,
											() => {this.hideComment()})
									}
								}}
							>
								{"❌Elimina"}
							</Dropdown.Item>



						</DropdownButton>
						:""}





					
						









						<div className="ms-2">

						<Card.Text className="mb-0 mb-1">
								{this.props.comm_info.body}
						</Card.Text>



						<div className="d-inline-flex">
							<ViGtVote post_id={this.props.comm_info.aportacio} comment_id={this.props.comm_info._id} votUsuari={this.props.comm_info.votUsuari} voteCount={this.props.comm_info.votes} key={this.props.comm_info.aportacio} key={"vote_"+this.props.comm_info._id} />


							<div className="d-inline-flex flex-grow">
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								<strong className="d-inline align-self-center">
									{" "}
								</strong>
							</div>
						</div>













						

						</div>

						

					</div>


				</div>



			</div>

			</div>
			</>
		);

	};
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
					//{"| ".repeat(comment.depth)}
					//{comment.body}
					//{comment.createdAt}
					//<br/><br/>
			return (
				<>
					<IndividualComment comm_info={comment} />
					{this.renderLinearizedTree(comment)}
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
				//console.log(data.comentaris[i].createdAt);
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
			

				<div className="my_comment_dropdown_selector d-flex justify-content-between ms-3 me-3" style={{backgroundColor:"rgba(0,0,0,0.0)"}}>
					<h5 className="align-self-end mb-0 fw-bold">Comentaris:</h5>

					<div className="my_dropdown_selector ordre_dropdown align-self-end">
						<OrdreDropdown current_ordre={this.props.current_ordre} current_criteri={this.props.current_criteri} reoder_comments={() => {this.reoder_comments();}} ref={this.ordcriDrop_ref} location={this.props.location} />
					</div>
				</div>









				<Card className={"commentlist mx-auto mb-0 w-100"} >
					<Card.Body className="py-1 px-1">



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