import React from 'react';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useParams } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel } from 'react-bootstrap';
import { Card, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";
import PostViGtory from "../components/PostViGtory";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/PostViGtory.css';

import '../libraries/cookie';

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
			current_page: current_page,
			posts_per_page: posts_per_page,
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
		
		let page = getPostsTest(0, 10);
		let posts = page.posts;
		/*let final_posts = Array.from(posts.map((post_info, i) => { 
			return (<PostViGtory key={i} post_info={post_info}></PostViGtory>);
			//return (<p key={i}>{post_info.post_comment_count}</p>);
		} ).values());

		console.log(final_posts);*/

		


		return(
			<>
				<NavBar />

				<br/><br/><br/><br/>

				Identified user with ID: {this.props.userID}

				{ posts.map((post_info, i) => { 
					return (
						<PostViGtory key={post_info.post_id} post_info={post_info}></PostViGtory>
					);
				} ) }

			</>
		);

	};
}



function UserProfile(props){
	//document.title = "ViGtory! Pàgina de " + "NOM_USUARI";
	//const { id } = useParams(); //Hay que usar el mismo nombre
	
	return(
		<InitialScreen userID={useParams().id} />
	)
}
export default UserProfile;