import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useLocation, useNavigate, useParams } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";
import PostViGtory from "../components/PostViGtory";
import PostEdit from "../components/PostEdit";
import ViGtPagination from "../components/ViGtPagination";
import ViGtSearch from "../components/ViGtSearch";
import RatingsAssignatura from "../components/RatingsAssignatura";


import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/Home.css';
//import '../css/PostViGtory.css';
//import '../css/PostEdit.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";
import {getUserData} from '../libraries/data_request';

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);




function randomFileListGenerator(max_length){
	var files = [];
	var length = Math.floor((max_length+1)*Math.random());
	for ( var i = 0; i < length; i++ ) {
		files.push(randomTextGenerator(20)+".txt");
	}
	return files;
}

function randomTextGenerator(max_length) {
	var result           = '';
	var characters       = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789   \n\t'\"@-_";
	var charactersLength = characters.length;
	let length = Math.floor((max_length+1)*Math.random());
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}



function getPostsTest(current_page, posts_per_page){

	let finalJSON = 
		{
			//jwt: jwt,
            //username: "fula__"+randomTextGenerator(30)+"__nito",
			posts_per_page: [5, 10, 15, 20][Math.floor(4*Math.random())],
			//total_page_count: Math.floor(1+100*Math.random()),
			numAportacions: Math.floor(100*Math.random()),
			//current_page: current_page,
			aportacions: []
		};

	for (let i=0; i<posts_per_page; i++){
		//let post_upvoted = ((Math.floor(2*Math.random())==1) ? true : false);
		finalJSON.aportacions.push(
			{
				userName: "fula__"+randomTextGenerator(30)+"__nito",

				_id: Math.floor(1000000*Math.random()),
				createdAt: new Date(),
				title: randomTextGenerator(100),
				body: randomTextGenerator(1000),

				votes: Math.floor(100*Math.random()),
				//post_upvotes: Math.floor(100*Math.random()),
				//post_downvotes: Math.floor(100*Math.random()),
				fitxers: randomFileListGenerator(5),
				post_comment_count: Math.floor(100*Math.random()),

				//post_upvoted: post_upvoted,
				//post_downvoted: (post_upvoted ? false : ((Math.floor(2*Math.random())==1) ? true : false) )
			}
		);
		if (Math.floor(3*Math.random()) > 0)
			finalJSON.aportacions[0]["votUsuari"] =((Math.random()<0.5) ? -1 : 1);
	}

	return finalJSON;
}















async function getPosts(search_fields_data){
	//search_fields_data es un JSON que contiene los campos NO VACÍOS de la búsqueda

	//console.log(search_fields_data);

	const data = new URLSearchParams();
	for (var key of Object.keys(search_fields_data)) {
		//console.log(key+" -> "+search_fields_data[key]);
		data.append(key, search_fields_data[key]);
	}
	//console.log("GET POSTS WITH INFO: "+data.toString());


	let err_mssg = "En aquests moments sembla que no podem contactar els nostres servidors.\nTorna a intentar-ho més endevant.";


	let response = {};
	let promise = new Promise(()=>{}, ()=>{}, ()=>{});
	
	let headers = new Headers();
	//headers.append("Content-Type", "text/plain");
	//headers.append("Content-Type", "application/json");

	//////////////headers.append("Content-Type", "application/x-www-form-urlencoded");
	//headers.append("Content-Type", "JSON");

	//headers.append("Access-Control-Allow-Origin", "*");
	
	headers.append("authorization", Cookie.get("jwt"));



	//console.log(API_address + "/aportacio/getAportacions\n"+Cookie.get("jwt"));
	//	console.log(API_address + "/aportacio/getAportacions?"+data);
	/*console.log("\nHEADERS vvvvvvvvvvvvvvvvvvvvvvvvvvvv")
	for (var pair of headers.entries()) {
		console.log(pair[0]+ ': '+ pair[1]);
	 }
	 console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\n")*/
	 
	let jsondata = {};

	return await fetch(
		//("http://localhost:4000/aportacio/getAportacions")
		//(API_address + "/grau/getAllGraus")
		(API_address + "/aportacio/getAportacions" +"?"+data)
		//(API_address + "/aportacio/getAportacions")
		, {
			method: "GET",
			mode: 'cors',
			//body: data,
			//body: search_fields_data,
			headers: headers,
			//cache: "no-cache",
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
		this.state = {
			
		};
		this.page = null;
		this.search_ref = React.createRef();
		this.postedit_ref = React.createRef();
		//this.navbar_ref = React.createRef();

		this.current_p = 1;
		this.last_p = 1234;
		this.current_assignatura = null;
		this.current_search = null;

		this.limit = 10;
		this.ordre = -1;
		this.criteri = 0;

		this.params = new URLSearchParams();

		this.isStudent = false;
	}

	/*
	renderPost(post_info) {
		return (
			<PostViGtory
				key={post_info._id}
				post_info={post_info}
			/>
		);
	}
	*/

	propagateUpdate(){
		if (this.postedit_ref.current)
		this.postedit_ref.current.updateSelected(this.current_assignatura);
		
		if (this.search_ref.current){
			this.search_ref.current.updateSelectedAssignatura(this.current_assignatura);
			this.search_ref.current.updateSearch(this.current_search);
			this.search_ref.current.updateLimit(this.limit);
			//console.log("ORDRE: "+this.ordre+", "+this.criteri)
			this.search_ref.current.updateOrdre(this.ordre, this.criteri);
		}
	}




	updatePageContent(data){

		this.page = data;

		//USAR Math.ceil(total/limit)
		//let last_p = 1234; //Este valor lo obtendríamos del GetAportacions
		this.last_p = Math.ceil((data?data.numAportacions:0)/this.limit);
		/*
			pageNum = Math.min(pageNum, last_p); //Para evitar números fuera de rango  //TO DO: NECESITARÍA QUE LA API SE COMPORTE DE FORMA SIMILAR A ESTO
			params.set("p", pageNum);
		*/
		if (this.current_p>this.last_p){
			this.current_p = this.last_p;
			this.params.set("p", this.current_p);
		}
	
	
	
	
	
		//console.log("LOCATION:"+this.props.location.pathname);
		window.history.replaceState(
			"", "",
			//( window.location.href.substr(0, window.location.href.lastIndexOf("/")+1) ) + "?" + params.toString()
			(BaseName==="/"?"":BaseName) + this.props.location.pathname + "?" + this.params.toString() //new URL
		);
	
		if ((this.current_p != 1) || (this.current_assignatura) || (this.current_search)){
			document.title = "ViGtory! Cerca"
	
			//+ (currentSearch ? " de \""+currentSearch+"\"" : "")
			+ (this.current_search ? " de «"+this.current_search+"»" : "")
			//+ (currentSearch ? " de ❝"+currentSearch+"❞" : "")
			//+ (currentSearch ? " de ❮❮"+currentSearch+"❯❯" : "")
	
			+ (this.current_assignatura ? " a "+this.current_assignatura : "")
			
			//+ ((pageNum != 1) ? " (pàgina "+pageNum+")" : "")
			+ (" (pàgina "+this.current_p+")")
			;
		}











		this.forceUpdate(); //Este force update hace que ViGtSearch y PostEdit fallen: "Cannot read properties of null reading updateSubjectList //Corrección jugando con los refs
	}


	getSearchFieldsData(){

		//Reconocimiento de parámetros de búsqueda en la URL (?x=z&a=b)
		this.params = new URLSearchParams(window.location.search);

		this.current_p = this.params.has("p") ? ( isNaN(parseInt(this.params.get("p"))) ? 1 : parseInt(this.params.get("p")) ) : 1;
		this.current_p = Math.max(this.current_p, 1); //Para evitar números negativos
		this.params.set("p", this.current_p);

		this.current_assignatura = this.params.has("sub") ? this.params.get("sub") : null;

		this.current_search = this.params.has("search") ? this.params.get("search") : null;

		this.limit = this.params.has("lim") ? this.params.get("lim") : this.limit;

		this.ordre = this.params.has("ord") ? this.params.get("ord") : this.ordre;
		this.criteri = this.params.has("cri") ? this.params.get("cri") : this.criteri;

		//console.log("HOME ORD CRI: "+this.ordre+", "+this.criteri);

		this.propagateUpdate();
		//this.propagateLimitUpdate(this.limit);





		let data = {};
		data["ordre"] = this.ordre; //-1; //( 1=Ascendent | -1=Descendent )
		data["criteri"] = this.criteri; //0; //( 0=Data | 1=Vots )
		data["limit"] = this.limit;
		data["pagina"] = this.current_p;

		//if (this.search_ref.current && this.search_ref.current.current_search)
		//	data["busca"] = this.search_ref.current.current_search;
		if (this.current_search)
			data["busca"] = this.current_search;

		//if (this.search_ref.current && this.search_ref.current.current_assignatura)
		//	data["sigles_ud"] = this.search_ref.current.current_assignatura;
		if (this.current_assignatura)
			data["sigles_ud"] = this.current_assignatura;
		

		if (this.props.useParams.username)
			data["usernameFind"] = this.props.useParams.username;
		
		return data;
	}


	
	render(){
		//console.log(this.getSearchFieldsData());


		//let page = getPostsTest(0, 10);
		//let page = getPostsTest(0, 10);
		//let posts = page.posts;
		let posts = this.page ? (this.page.aportacions ? this.page.aportacions : []) : [];
		//console.log(posts);
		/*let final_posts = Array.from(posts.map((post_info, i) => { 
			return (<PostViGtory key={i} post_info={post_info}></PostViGtory>);
			//return (<p key={i}>{post_info.post_comment_count}</p>);
		} ).values());

		console.log(final_posts);*/

		this.postEdit = <PostEdit new_post={true} current_assignatura={this.current_assignatura} postedit_ref={this.postedit_ref} isStudent={this.isStudent} />;

		this.ViGtSearch = <ViGtSearch current_assignatura={this.current_assignatura} current_search={this.current_search} search_ref={this.search_ref} current_limit={this.limit} />

		



		return(
			<>
				<NavBar currentSection={this.props.currentSection} />

				<br/><br/><br/><br/>



				{this.props.useParams.username ? 
				<>
					<h2 className="text-center home_title">
					{"Publicacions aportades per "}
					<b><Link to={"/user/"+this.props.useParams.username} className="text-reset text-decoration-none">
						{this.props.useParams.username}
					</Link></b>
					{":"}
					</h2>
					<br/>
				</>
				:(
					(/*this.current_p==1 &*/ this.current_assignatura)?
					<>
						<h2 className="text-center home_title">
						{"Publicacions de l'assignatura "}
						<b><Link to={"/?p=1&sub="+this.current_assignatura} className="text-reset text-decoration-none">
							{this.current_assignatura}
						</Link></b>
						{":"}
						</h2>
						<RatingsAssignatura sub={this.current_assignatura} key={"VOTE_"+this.current_assignatura} isStudent={this.isStudent} />
					</>
					:
					""
				)}




				{this.ViGtSearch}

				{this.postEdit}

				<br/><br/>

				{ (posts.length>0) ?
					posts.map((post_info, i) => { 
						return (
							<PostViGtory key={post_info._id} post_info={post_info} individualView={false} isStudent={this.isStudent} ></PostViGtory>
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

				<br/><br/>

				<ViGtPagination current_p={this.current_p} last_p={this.last_p} />

				<br/><br/><br/><br/>

			</>
		);

	};
}



function Home(props){
	document.title = "ViGtory! Pàgina principal";

	//console.log(window.location.href);

	const location =  useLocation();
	const params =  useParams();
	//let loc = location.pathname;
	//console.log("USERNAME: " + useParams().username); //nombre o undefined


	//let screen_ref = React.createRef();
	let screen_ref = props.home_ref;
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


		//let data = getPostsTest(0, 0);
		//let data = getPostsTest(0, 10);
		//screen_ref.current.updatePageContent(data);


		
		getUserData().then((UserData) => {
			screen_ref.current.isStudent = UserData.emailStudentConfirmed;
			
			let search_fields_data = screen_ref.current.getSearchFieldsData();
			//console.log(search_fields_data);
			getPosts(search_fields_data).then((data) => {
				//console.log(data);
				//console.log("screen_ref.current: "+screen_ref.current)
				//if (screen_ref.current)
				screen_ref.current.updatePageContent(data);//Algo se rompe al usar esto; puede que tenga que ver con las peticiones recursivas //SE HA SOLUCIONADO AÑADIENDO <React.StrictMode> EN index.js???????? O puede que no...
			});
		});

	}, [window.location.href]);//[window.location.search]); //Seguramente haya alguna alternativa mejor, pero por el momento me quedo con esta (window.location.search) (para que se actualice el objeto que contiene la página al cargar nuevas publicaciones)











	return(
		<>
		{screen}
		</>
	)
}
export default Home;