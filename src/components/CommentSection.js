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
import '../css/CommentSection.css';

import {Cookie} from '../libraries/cookie';
import {BaseName} from "../libraries/basename";
import {getUserData} from '../libraries/data_request';















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



async function sendComentari(newTeditF, post_id, text, _id, postEditAct){
	
	let data = new URLSearchParams();
	if (newTeditF)
		data.append("idAportacio", post_id);

	data.append((newTeditF ? "body" : "newBody"), text);

	if (_id)
		data.append((newTeditF ? "idParent":"comentariId"), _id);

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		API_address + "/comentari/"+(newTeditF ? "new":"edit")+"Comentari", {
			method: (newTeditF ? "POST":"PUT"),
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
				
				if (newTeditF){
				//window.location.reload();
				window.location.href = 
						window.location.protocol+"//"+window.location.host+
						(BaseName==="/"?"":BaseName) + "/post/"+post_id+"?ord=-1&cri=0" //Secció de comentaris de l'aportació actual, amb vista als comentaris més recents
				}
				else{postEditAct(text);}
			
			
			
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











class TextAreaInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			valid: true,
			err_msg: ""
		};
		this.content_txt = "";
		this.valid = false;
	}


	validate_content_clientside(){

		let content = this.content_txt;
		//console.log("CONTENT: "+content);
		if (content.length <= 0){
			this.setState({
				valid: false,
				//err_msg: validations[i][regex]
				err_msg: "No pots "+(this.props.newTeditF?"enviar":"desar")+" un comentari buit."
			});
			this.valid = false;
			return this.valid;
		}
		//Si todo es correcto
		this.setState({
			valid: true,
			err_msg: ""
		});
		this.valid = true;
		return this.valid;
	}


/*
	{this.props.isStudent?<></>:
		<Form.Label
			className="mb-3"
			size="sm"
			style={{color:"rgba(255,0,0,0.8)"}}
		>
			{"Només els usuaris verificats com a estudiants poden crear i publicar comentaris."}
		</Form.Label>
	}
*/

	render(){
		//console.log(this.props.isStudent);
		return(
			//La key, aunque redundante, es necesaria para que React se entere de que ha habido un cambio y se ha comprobado que el usuario es estudiante... Para más inri, el error solo sucedía en los casos en los que todavía no había ningún comentario. Cuando sí que hay algún comentario, el renderizado es el correcto...
			//Era un problema de defaultValue, en que se asignaba el valor por defecto al input, y luego el valor por defecto cambiaba pero el valor que contenía el input ya estaba establecido y por tanto no cambiaba. De ahí la necesidad de que React cargase un elemento de input completamente nuevo. Habría otras formas de hacerlo, pero esta sufice, por el momento.
			<>
				<Form.Control
					key={(
						(!this.props.parentTreplyF) ? 
						(
							this.props.newTeditF ?
								("input_new_reply_"+this.props.comm_id+"_"+(this.props.isStudent?"s":"ns"))
							: 
								("input_edit_comm_"+this.props.comm_id+"_"+(this.props.isStudent?"s":"ns"))
						)
						:
						("input_new_comment_"+this.props.post_id+"_"+(this.props.isStudent?"s":"ns")) 
							
					)}
					readOnly={(!this.props.isStudent)
					//false
					}
					type="text" 
					as="textarea" 
					name="body"
					placeholder="Opino que... Afegeixo..."
					onChange={(e) => {this.content_txt=e.currentTarget.value; this.validate_content_clientside(); this.props.global_validity_action();}}
					required 
					rows={this.props.parentTreplyF ? "5" : "3"}
					size="sm"
					isInvalid={(!this.props.isStudent) || (!this.state.valid)}
					style={{zIndex:"0", position:"relative"}}
					defaultValue={((!this.props.isStudent) ?
						("Només els usuaris verificats com a estudiants poden crear i publicar comentaris.")
					:
						(this.props.newTeditF ? "":this.props.body)
					)}
				/>


				<p className={"my-0 "+(this.props.parentTreplyF?"text-center":"text-end")} >
					<Button 
						type="submit" 
						size="sm" 
						className="mt-1 mb-0 pt-0 addCommentButton" 
						disabled={!this.valid}
						style={this.props.parentTreplyF ? {} : {
							zIndex:"5",
							position:"absolute",
							bottom:"0",
							right:"0.2rem"
						}}
					>
						{this.props.newTeditF ? "Comenta" : "Edita"}
					</Button>
				</p>


				{
					/*this.valid?"":
					<p style={{
						color:"#dc3545", 
						position:"absolute", 
						bottom:"-0.9rem", 
						left:"0.5rem",
						zIndex:"5"
					}}>
						{this.state.err_msg}
					</p>
				*/}
				{
				<Form.Control.Feedback 
					type="invalid"
					style={{
						position:"absolute", 
						bottom:((this.props.parentTreplyF)?"2.1rem":"0.1rem"), 
						left:"0.5rem",
						zIndex:"5",
						width:"fit-content",
						//whiteSpace:"normal"
					}}
				>
					{this.state.err_msg}
				</Form.Control.Feedback>
				}

			</>

		);
	};
}




















class CommentEdit extends React.Component{

	constructor(props) {
		super(props);
		this.state = {allValid: false};
		this.new_body_ref = React.createRef();
	}

//<CommentEdit comm_id={this.props.comm_info._id} post_id={this.props.post_id} parentTreplyF={false}/>



	checkLocalValidity(notify_invalid){
		let valid = true;
		valid = this.new_body_ref.current.validate_content_clientside();
		this.setState({allValid: valid});
		//console.log(this.getCurrentEditedData());
		return valid;
	}


	submitButtonAction(event){
		event.preventDefault();

		//console.log("button clicked");

		if (!this.checkLocalValidity(true)){
			alert("Tots els camps han de ser omplerts correctament.");
			return;
		}
		
		let postEditAct = this.props.postEditAct ? (n_b)=>{this.props.postEditAct(n_b)} : ()=>{};
		sendComentari(this.props.newTeditF, this.props.post_id, this.new_body_ref.current.content_txt, this.props.comm_id, postEditAct);

	}





	render(){
		return(<>

			<Accordion.Collapse eventKey={(
					(!this.props.parentTreplyF) ? 
					(
						this.props.newTeditF ?
							("accord_new_reply_"+this.props.comm_id)
						: 
							("accord_edit_comm_"+this.props.comm_id)
					)
					:
					("accord_new_comment_"+this.props.post_id) 
						
				)} style={{zIndex: "5", position: "relative"}}><div>
				{/*
				<div className="ms-1">
				{Array.apply(null, Array(this.props.depth)).map(()=>{
					return(
						<div className="d-inline flex-grow ms-2" style={{backgroundColor:"rgba(0,127,191,0.4)", color:"rgba(0,0,0,0)"}} >{"."}</div>
					);
				})}
				</div>
				*/}
				<Form noValidate method="post" action="http://httpbin.org/post" onSubmit={(e) => this.submitButtonAction(e)} >

				<div id={this.props.parentTreplyF ? "comm_"+this.props.post_id : "reply_"+this.props.comm_id} className={"my-0 mx-1"} style={{maxWidth:"100%"}}>

					<TextAreaInput newTeditF={this.props.newTeditF} ref={this.new_body_ref} global_validity_action={() => this.checkLocalValidity()} parentTreplyF={this.props.parentTreplyF} body={this.props.body} isStudent={this.props.isStudent} />
					

				</div>

				</Form>
				

			</div></Accordion.Collapse>



		</>);
	}



}























function ScreenToggleNewCommEdit({ children, eventKey, parentTreplyF }){
	const { activeEventKey } = useContext(AccordionContext);
	const switchScreen = useAccordionButton(eventKey, null);

	//console.log(eventKey);
	//console.log(activeEventKey);
	
	return(<>

		<Button 
			onClick={switchScreen}
			variant={parentTreplyF ? "primary" : "outline-primary"}
			size={parentTreplyF ? "md" : "sm"}
			fontWeight="bolder"
			className={"py-0 border-0 new_comment_button "+(parentTreplyF ? "mt-1" : "ps-2 pe-1 open_reply_button")}
		>
			<b className="d-flex align-items-center">
				<span style={{fontFamily: "monospace", padding:"0"}}>
					{//Ojo, que usamos "–", no "-"; tiene exactamente el mismo ancho que "+"
						((eventKey===activeEventKey)?"–":"+")
					}
				</span>
				&nbsp;
				{parentTreplyF ? "Nou comentari" : "Respon"}
			</b>
		</Button>

	</>);
}

function ScreenToggleCommEdit({ children, eventKey, comm_id }){
	const { activeEventKey } = useContext(AccordionContext);
	const switchScreen = useAccordionButton(eventKey, null);
	
	return(<>

		<Dropdown.Item 
			size="sm"
			key={"edit_"+comm_id}
			onClick={switchScreen}
			id={"open_accord_edit_comm_"+comm_id}
		>
			{(eventKey===activeEventKey)?"✏️Deixa d'editar":"✏️Edita"}
		</Dropdown.Item>

	</>);
}









class IndividualComment extends React.Component {

	constructor(props) {
		super(props);
		this.depth = props.comm_info.depth ? props.comm_info.depth : 0;
		this.showComment = true;

		this.body = props.comm_info.body ? props.comm_info.body : "";
		this.deleted = props.comm_info.esborrat ? props.comm_info.esborrat : false;
		this.edited = props.comm_info.editat ? props.comm_info.editat : false;
		this.edited_now = false;
	}



	hideComment(){
		//this.showComment = false;
		this.deleted = true;
		this.forceUpdate();
	}
	markAsEdited(new_body){
		this.edited = true;
		this.edited_now = true;
		this.body = new_body;
		//useAccordionButton("accord_edit_comm_"+this.props.comm_info._id, null);
		window.document.getElementById("open_accord_edit_comm_"+this.props.comm_info._id).click()

		this.forceUpdate();
	}


	render(){
		this.body = this.edited_now ? this.body : (this.props.comm_info.body ? this.props.comm_info.body : "");
		this.deleted = this.props.comm_info.esborrat ? this.props.comm_info.esborrat : false;
		this.edited = this.edited_now ? this.edited_now : (this.props.comm_info.editat ? this.props.comm_info.editat : false);


		let shadWid = "1px";
		let delCol = "rgba(255,0,0,1)";
		let ediCol = "rgba(255,255,0,1)";
		
		if (!this.showComment) return(<></>);


		let date = new Date(this.props.comm_info.createdAt);



		return(
			<>

			<Accordion className="m-0" defaultActiveKey={""} >
			<div className="d-flex mx-1">

				{Array.apply(null, Array(this.depth)).map(()=>{
					return(
						<div className="d-inline flex-grow ms-2" style={{
							//backgroundColor:"rgba(0,127,191,0.4)", 
							backgroundColor:"rgba(146,200,227,1)", 
							boxShadow: "0.08rem 0 0.05rem rgba(0,0,0,0.3)",
							color:"rgba(0,0,0,0)"
							}} >{"."}</div>
					);
				})}
				

				<div id={"comment_"+this.props.comm_info._id} className={"mb-0 mt-2 flex-fill"} style={{maxWidth:"100%"}}>
					{
						//^^^^^ overflow-hidden impide que los comentarios se salgan de la card, pero también impide visualizar correctamente el dropdown... PARECE que con maxWidth se soluciona
					}

					<div className={"mx-auto mb-0 p-1"} style={{
						//backgroundColor:"rgba(0,127,191,0.15)", 
						//backgroundColor:"rgba(229,242,248,1)", 
						backgroundColor:"rgba(209,232,242,1)", 
						boxShadow: "0.08rem 0.1rem 0.1rem rgba(0,0,0,0.5)",
						borderRadius:"0.5rem"}} >

						<div className="pb-0" >


							<div className="mt-1 mb-1 ms-0 d-inline" style={{width:"fit-content"}}>
								<strong className="text-muted d-inline">
									<Link to={this.props.comm_info.esborrat?"/post/"+this.props.post_id:"/user/"+this.props.comm_info.userName} className="text-reset text-decoration-none username_nav px-1">
										{false ? <img src="aaa" className="user_access_icon d-inline" /> : <></>}
										<b>{this.props.comm_info.esborrat?"???":this.props.comm_info.userName}</b>
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

							{(Cookie.get("username")===this.props.comm_info.userName && !this.props.comm_info.esborrat)?
							<DropdownButton
								align="end"
								key={"dropdownbutton"}
								variant="light"
								size="md"
								title={"⋮"}
								className="float-end d-inline"
							>

								<ScreenToggleCommEdit eventKey={"accord_edit_comm_"+this.props.comm_info._id} comm_id={this.props.comm_info._id} />


								<Dropdown.Item 
									size="sm"
									key={"del_"+this.props.comm_info._id}
									className="delete_comm_btn"
									onClick={()=>{
										if (window.confirm("Realment vols eliminar aquest comentari?\n\nContingut:\n    «"+this.props.comm_info.body+"»")){
											deleteComentari(
												this.props.comm_info._id,
												() => {this.hideComment()})
										}
									}}
								>
									{"❌Elimina"}
								</Dropdown.Item>



							</DropdownButton>
							:""}





						
							









							<div className="ms-2">

							<Card.Text className="mb-0 mb-1" style={{whiteSpace:"pre-line"}}>
								<span style={
									this.deleted
											?
											{
												fontWeight:"bolder", 
												//textStroke: "5px red",
												//textShadow:"0 0 2px rgba(255,0,0,1)"
												color:"white",
												textShadow:(
													"-"+shadWid+" -"+shadWid+" 0px "+delCol+","+
													" "+shadWid+" -"+shadWid+" 0px "+delCol+","+
													"-"+shadWid+"  "+shadWid+" 0px "+delCol+","+
													" "+shadWid+"  "+shadWid+" 0px "+delCol
												)
											}
											:
											(this.edited ?
												{
													fontWeight:"bolder", 
													//textStroke: "5px yellow",
													//textShadow:"0 0 2px rgba(255,255,0,1)"
													//color:"white",
													textShadow:(
														"-"+shadWid+" -"+shadWid+" 0px "+ediCol+","+
														" "+shadWid+" -"+shadWid+" 0px "+ediCol+","+
														"-"+shadWid+"  "+shadWid+" 0px "+ediCol+","+
														" "+shadWid+"  "+shadWid+" 0px "+ediCol
													)
												}
												:
												{}
											)
									}>
										{
											this.deleted
											?
											"<comentari esborrat>"
											:
											(this.edited ?
												"<comentari editat>"
												:
												""
											)
										}
								</span>
								{this.deleted ? "" : 
									<>{this.edited?<br/>:""}
									{this.body}
									</>
								}
							</Card.Text>



							<div className="d-inline-flex">
								<ViGtVote post_id={this.props.comm_info.aportacio} comment_id={this.props.comm_info._id} votUsuari={this.props.comm_info.votUsuari} voteCount={this.props.comm_info.votes} key={this.props.comm_info.aportacio} key={"vote_"+this.props.comm_info._id} />


								<div className="d-inline-flex flex-grow">
									&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
									<strong className="d-inline align-self-center">
										{" "}



										<span className="text-center" style={{marginBottom: "-1.25rem", zIndex: "6", position: "relative"}} >
											<ScreenToggleNewCommEdit eventKey={"accord_new_reply_"+this.props.comm_info._id} parentTreplyF={false}/>
										</span>






									</strong>
								</div>
							</div>








							

							</div>
						</div>
					</div>
				</div>
			</div>
			

			<CommentEdit newTeditF={false} comm_id={this.props.comm_info._id} post_id={this.props.post_id} parentTreplyF={false} depth={this.depth+1} body={this.body} postEditAct={(n_b)=>{this.markAsEdited(n_b)}} isStudent={this.props.isStudent} />
			<CommentEdit newTeditF={true} comm_id={this.props.comm_info._id} post_id={this.props.post_id} parentTreplyF={false} depth={this.depth+1} isStudent={this.props.isStudent} />

			</Accordion>

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

		this.isStudent = false;
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
					<IndividualComment comm_info={comment} post_id={this.props.post_id} isStudent={this.isStudent} />
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









				<Card className={"commentlist mx-auto mb-0 w-100 pb-1"+(this.comment_tree.replies.length>0 ? "":" no_commentlist")} >
					<Card.Body className="py-1 px-1">



					{
						(this.comment_tree.replies.length > 0) ?
						<>


							<Accordion className="m-0 mb-2" defaultActiveKey={""}>
								<p className="text-center" style={{marginBottom: "-0.5rem", zIndex: "6", position: "relative"}} >
									<ScreenToggleNewCommEdit eventKey={"accord_new_comment_"+this.props.post_id} parentTreplyF={true}/>
								</p>
								<CommentEdit newTeditF={true} comm_id={null} post_id={this.props.post_id} parentTreplyF={true} isStudent={this.isStudent} />
							</Accordion>

							{this.renderLinearizedTree(this.comment_tree)}

						</>:<>



							<p className="text-center">
								<br/>
								No hi ha cap comentari que mostrar aquí.
								<br/><br/>
								Sigues la primera persona a comentar!
								<br/>
							</p>

							<Accordion className="m-0" defaultActiveKey={""}>
								<p className="text-center" style={{marginBottom: "-0.5rem", zIndex: "6", position: "relative"}} >
									<ScreenToggleNewCommEdit eventKey={"accord_new_comment_"+this.props.post_id} parentTreplyF={true}/>
								</p>
								<CommentEdit newTeditF={true} comm_id={null} post_id={this.props.post_id} parentTreplyF={true} isStudent={this.isStudent} />
							</Accordion>
							<br/>

						</>
					}

						

					</Card.Body>
				</Card>
			</div>
			
			<br/><br/><br/><br/><br/>
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
		getUserData().then((UserData) => {
			commentSection_ref.current.isStudent = UserData.emailStudentConfirmed;

			commentSection_ref.current.reoder_comments();
		});
	}, []);




	return(
		<InitialScreen post_id={props.post_id} location={location} ref={commentSection_ref} />
	)
}
export default CommentSection;