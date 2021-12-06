import React from 'react';
import { useEffect } from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";
import PostViGtory from "../components/PostViGtory";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/PostViGtory.css';

import { Cookie } from '../libraries/cookie';

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
            username: "fula__"+randomTextGenerator(30)+"__nito",
			posts_per_page: [5, 10, 15, 20][Math.floor(4*Math.random())],
			total_page_count: Math.floor(100*Math.random()),
			current_page: current_page,
			posts: []
		};

	for (let i=0; i<posts_per_page; i++){
		let post_upvoted = ((Math.floor(2*Math.random())==1) ? true : false);
		finalJSON.posts.push(
			{
				user_id: Math.floor(1000*Math.random()),
				user_name: "fula__"+randomTextGenerator(30)+"__nito",

				post_id: Math.floor(1000000*Math.random()),
				post_date: new Date(),
				post_content: randomTextGenerator(1000),
				post_upvotes: Math.floor(100*Math.random()),
				post_downvotes: Math.floor(100*Math.random()),
				post_files: randomFileListGenerator(5),
				post_comment_count: Math.floor(100*Math.random()),

				post_upvoted: post_upvoted,
				post_downvoted: (post_upvoted ? false : ((Math.floor(2*Math.random())==1) ? true : false) )
			}
		);
	}

	return finalJSON;
}

















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			
		};
		
	}


	renderPost(post_info) {
		return (
			<PostViGtory
				key={post_info.post_id}
				post_info={post_info}
			/>
		);
	}








	
	render(){
		/*if (!Cookie.get("jwt")){
			this.props.navigate("/signin");
		}*/



		let page = getPostsTest(0, 10);
		let posts = page.posts;
		/*let final_posts = Array.from(posts.map((post_info, i) => { 
			return (<PostViGtory key={i} post_info={post_info}></PostViGtory>);
			//return (<p key={i}>{post_info.post_comment_count}</p>);
		} ).values());

		console.log(final_posts);*/


		return(
			<>
				<NavBar currentSection={this.props.currentSection} />

				<br/><br/><br/><br/>

				{ posts.map((post_info, i) => { 
					return (
						<PostViGtory key={post_info.post_id} post_info={post_info}></PostViGtory>
					);
				} ) }

			</>
		);

	};
}



function Home(props){
	document.title = "ViGtory! Pàgina principal";


	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}
	useEffect(() => {
		if (!Cookie.get("jwt")){
			navigateTo("/signin");
		}
	  }, []);


	return(
		<InitialScreen currentSection={props.currentSection} />
	)
}
export default Home;