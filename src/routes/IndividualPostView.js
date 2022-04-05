import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useLocation, useNavigate, useParams } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, Dropdown, ListGroup } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";
import PostViGtory from "../components/PostViGtory";
import PostEdit from "../components/PostEdit";
import ViGtPagination from "../components/ViGtPagination";
import ViGtSearch from "../components/ViGtSearch";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/IndividualPostView.css';
//import '../css/PostViGtory.css';
//import '../css/PostEdit.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);














async function getPostData(post_id){
	

	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";

	let response = {};
	let headers = new Headers();
	headers.append("authorization", Cookie.get("jwt"));

	return await fetch(
		(API_address + "/aportacio/getAportacio" +"?_id="+post_id)
		, {
			method: "GET",
			mode: 'cors',
			headers: headers,
			timeout: 5000
	})
	.then(
		resp => { //SÍ ha sido posible conectar con la API

			//Si todo es correcto (status 200-299)
			if (resp.ok){
				response = resp.json();
				//Aquí se podrían hacer cosas pero no es necesario
			}
			else{
				window.alert(resp.statusText);
				return;
			}
			
			return response;
		}, 
		resp => { //NO ha sido posible conectar con la API
			//console.log("ERR: "+resp);
			window.alert(err_mssg);
			return;
		}
	)
	/*.then(
		data => {
			if (data === undefined) return;
			//console.log(data);
			jsondata = data;
			callback(data);
			return data;
		}
	);*/
}
















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.params = new URLSearchParams();
	}


	renderPost(post_info) {
		return (
			<PostViGtory
				key={post_info._id}
				post_info={post_info}
			/>
		);
	}


	updatePageContent(data){

		this.page = data;
	
		//console.log("LOCATION:"+this.props.location.pathname);
		/*window.history.replaceState(
			"", "",
			//( window.location.href.substr(0, window.location.href.lastIndexOf("/")+1) ) + "?" + params.toString()
			(BaseName==="/"?"":BaseName) + this.props.location.pathname + "?" + this.params.toString() //new URL
		);*/
	
		document.title = "ViGtory! Publicació"
		+ (this.page ? (this.page.aportacio ? " a " + this.page.aportacio.sigles_ud +": "+this.page.aportacio.title : "") : "")
		;






		this.forceUpdate(); //Este force update hace que ViGtSearch y PostEdit fallen: "Cannot read properties of null reading updateSubjectList //Corrección jugando con los refs
	}



	
	render(){

		let posts = this.page ? (this.page.aportacio ? this.page.aportacio : []) : [];

		return(
			<>
				<NavBar currentSection={this.props.currentSection} />

				<br/><br/><br/><br/>



				{ (posts.length>0) ?
					posts.map((post_info, i) => {

						let file_list = post_info.fitxers ? post_info.fitxers : [];

						return (
						<>
							<PostViGtory key={post_info._id} post_info={post_info} individualView={true} ></PostViGtory>


							{
								((file_list.length > 0) && (!this.props.individualView)) ?
						
								<>
								<div className="fitxersDownloadList mb-0 px-3 mt-2">
								<p className="fitxersDownloadAmount mb-0 px-3 pt-1">
									{file_list.length}{" Fitxer"}{file_list.length==1 ? "":"s"}
								</p>
								</div>
								<ListGroup className="fitxersDownloadList">
									
									{file_list.map((filename, i, namelist) => {return (
										<ListGroup.Item className="pe-2">
											<span className="text-decoration-none d-flex align-items-center justify-content-between">
												<span className="text-break me-2">
												{filename}
												</span>
												<span 
													className="individualDownload px-2" 
													style={{whiteSpace:"nowrap"}}
													onClick={()=>{console.log("click click")}}
												>
												Descarrega
												&nbsp;
												<h5 className="d-inline my-0 text-decoration-underline">⇩</h5></span>
											</span>
											
										</ListGroup.Item>
									);})}
									<Button 
										size="sm"
										onClick={()=>{console.log("CLICK")}}
									>
										{/*justify-content-between es una alternativa interesante*/}
										<b className="text-decoration-none d-flex align-items-center justify-content-center">
											<h3 className="d-inline my-0 text-decoration-underline">⇩</h3>
											&nbsp;&nbsp;{"Descarrega-ho tot com a .zip"}&nbsp;&nbsp;
											<h3 className="d-inline my-0 text-decoration-underline">⇩</h3>
										</b>
									</Button>

								</ListGroup>
								</>
							: ""}









						</>
						);
					} )
					:
					<p className="text-center">
						<br/><br/>
						No hi ha cap aportació que mostrar aquí.
						<br/><br/>
						Tornar a l'inici?
						<br/><br/>
						<Link to="/"><Button>Pàgina principal</Button></Link>
					</p>
				}



				<br/><br/><br/><br/>

			</>
		);

	};
}



function IndividualPostView(props){
	document.title = "ViGtory! Aportació";


	const location = useLocation();
	const params = useParams();
	//let loc = location.pathname;
	//console.log("USERNAME: " + useParams().username); //nombre o undefined


	let screen_ref = React.createRef();
	//let screen_ref = props.home_ref;
	let screen = <InitialScreen currentSection={props.currentSection} ref={screen_ref} location={location} useParams={params} />


	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}
	useEffect(() => {
		if (!Cookie.get("jwt")){
			navigateTo("/signin");
		}



		getPostData(params.id).then((data) => {
			console.log(data);
			console.log("screen_ref.current: "+screen_ref.current)
			//if (screen_ref.current)
			screen_ref.current.updatePageContent(data);
		});

	}, []);











	return(
		<>
		{screen}
		</>
	)
}
export default IndividualPostView;