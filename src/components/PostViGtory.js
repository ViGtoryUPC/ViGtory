import React from 'react';
import { useEffect, useContext } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, DropdownButton, AccordionContext, useAccordionButton } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Dropdown, Popover } from 'react-bootstrap';

import ViGtVote from "./ViGtVote";
import PostEdit from "../components/PostEdit";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/PostViGtory.css';

import {Cookie} from '../libraries/cookie';
import {BaseName} from "../libraries/basename";















async function deletePost(post_id, individual, sub, hidePost){
	
	let data = new URLSearchParams();
	data.append("aportacioId", post_id);
	

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";


	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	headers.append("Content-Type", "application/x-www-form-urlencoded");
	

	headers.append("authorization", Cookie.get("jwt"));

	let resp_ok = true;

	promise = await fetch(
		API_address + "/aportacio/deleteAportacio", {
			method: "DELETE",
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
				
				if (individual){
					//window.location.reload();
					window.location.href = 
						window.location.protocol+"//"+window.location.host+
						(BaseName==="/"?"":BaseName) + "/?sub="+sub //Pàgina 1 de l'assignatura
				}
				else{hidePost();}
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

















function ScreenTogglePostEdit({ children, eventKey, post_id, focusRef }){
	const { activeEventKey } = useContext(AccordionContext);
	const switchScreen = useAccordionButton(eventKey, null);
	
	return(<>

		<Dropdown.Item 
			size="sm"
			key={"edit_"+post_id}
			onClick={()=>{
				switchScreen();
				
				if (!window.isMobileOrTablet())
				setTimeout(()=>{focusRef();},100);
			}}
			id={"open_accord_edit_post_"+post_id}
		>
			{(eventKey===activeEventKey)?"✏️Deixa d'editar":"✏️Edita"}
		</Dropdown.Item>

	</>);
}








/*var stringToColor = function(str) {
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	var color = '#';
	for (var i = 0; i < 3; i++) {
		var value = (hash >> (i * 8)) & 0xFF;
		color += ('00' + value.toString(16)).substr(-2);
	}
	return color;
}*/


function stringToColor(value, lightness) {
	//console.log("stringToColor input value: "+value);
    return value.getHashCode().intToHSL(lightness);
}
String.prototype.getHashCode = function() {
    var hash = 0;
    if (this.length == 0) return hash;
    for (var i = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};
Number.prototype.intToHSL = function(lightness) {
    var shortened = this % 360;
    return "hsl("+shortened+",100%,"+lightness+"%)";
};





class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.showPost = true;
		this.postedit_ref = React.createRef();
		this.edited = props.post_info.editat ? props.post_info.editat : false;
	}



	hidePost(){
		this.showPost = false;
		this.forceUpdate();
	}


	render(){
		
		if (!this.showPost) return(<></>);

		//this.edited=true;
		let shadWid = "1px";
		let ediCol = "rgba(255,255,0,1)";

		let date = new Date(this.props.post_info.createdAt);
		let file_list = this.props.post_info.fitxers ? this.props.post_info.fitxers : [];


		this.postEdit = <PostEdit new_post={false} current_assignatura={this.current_assignatura} postedit_ref={this.postedit_ref} post_info={this.props.post_info} isStudent={this.props.isStudent} />;


		return(
			<>
			<div className={"mx-auto"+(this.props.individualView?" mb-0 individual":" mb-5")} >
			<Accordion defaultActiveKey={""}>

			<div className={"post mx-auto"} >
				
				{/*<div className="d-flex px-2 justify-content-end">
					{(Cookie.get("username")===this.props.post_info.userName)?				
						<Button
							size="sm"
							variant="danger"
							className="px-1 py-0"
							style={{borderBottomLeftRadius:0, borderBottomRightRadius:0}}
							onClick={()=>{
								if (window.confirm("Realment vols eliminar aquesta aportació?\n\nTítol:\n    «"+this.props.post_info.title+"»")){
									deletePost(
										this.props.post_info._id,
										this.props.individualView,
										this.props.post_info.sigles_ud,
										() => {this.hidePost()})
								}
							}}
						>❌Elimina</Button>
					:""}
				</div>*/}


				<Card className={"mx-auto mb-0"} >



					


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


							<ScreenTogglePostEdit eventKey={"accord_edit_post_"+this.props.post_info._id} post_id={this.props.post_info._id} focusRef={()=>{this.postedit_ref.current.new_body_ref.current.focus()}} />


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
							<span className="text-muted">
								{"diu:"}
							</span>
							<br/>
						</div>










						








						
						<div className="mt-1 mb-2"><Link to={"/post/"+this.props.post_info._id} className="text-reset text-decoration-none">
							<Card.Title className="d-inline" style={{whiteSpace:"pre-line"}}>
								<b>{this.props.post_info.title}</b>
							</Card.Title>
						</Link>
						</div>




						<Card.Text style={{whiteSpace:"pre-line"}}>

							<span style={
									(this.edited ?
										{
											fontWeight:"bolder", 
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
								{this.edited ?
									<>{"<contingut editat>"}<br/></>
								:""}
							</span>
							{this.props.post_info.body}



						</Card.Text>


						<div className="d-inline-flex">
							<ViGtVote post_id={this.props.post_info._id} comment_id={null} votUsuari={this.props.post_info.votUsuari} voteCount={this.props.post_info.votes}/>


							<div className="d-inline-flex flex-grow">
								&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
								<Link to={"/post/"+this.props.post_info._id} className="d-inline align-self-center text-reset text-decoration-none"><strong>
									{this.props.post_info.comentaris?this.props.post_info.comentaris:"0"}{" Comentari"}{this.props.post_info.comentaris==1 ? "":"s"}
								</strong></Link>
							</div>
						</div>

						
						{((file_list.length > 0) && (!this.props.individualView)) ?
						
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip className="tooltip_fitxers"><ol className="mt-1 mb-1">
									{file_list.map((file, i, filelist) => {
										let filename = file[0];
										return (
										<li>
											{filename}
											{i<filelist.length-1 ? <Dropdown.Divider className="mt-1 mb-1" /> : ""}
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
				{this.postEdit}
				</Accordion>
			</div>
			</>
		);

	};
}






function PostViGtory(props){

	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}

	return(
		<InitialScreen post_info={props.post_info} individualView={props.individualView} navigate={navigateTo} isStudent={props.isStudent} />
	)
}
export default PostViGtory;