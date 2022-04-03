import React from 'react';
import { useEffect } from 'react';


import { Routes, Route, Link, useNavigate } from "react-router-dom";

import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Container, Button } from 'react-bootstrap';
import { Form, FormControl } from 'react-bootstrap';


import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/nav_bar.css';

import { Cookie } from '../libraries/cookie';
import { getUserData } from '../libraries/data_request';

import logo_ViGtory from '../assets/images/ViGtory_logo.png';
import profile_img from '../assets/images/Profile.png';
import settings_img from '../assets/images/Settings.png';
import logout_img from '../assets/images/Logout.png';






class InitialScreen extends React.Component {
//function InitialScreen(props) {

	constructor(props) {
		super(props);
	}

	handleSelect(eventKey){
		//alert(`selected ${eventKey}`);
		console.log(`selected ${eventKey}`);
		if (eventKey === "logout"){
			//Borramos las cookies de sesión
			Cookie.delete("jwt");
			this.props.navigate("/signin");
		}
	}

	/*updateData(data){
		this.userData = data;
		this.forceUpdate();
	}*/
	
	render(){
		//defaultActiveKey="/"
		//justify
		//variant="pills" 
		//variant="tabs" 
		//let nom_usuari = ((this.userData) ? (this.userData.usuari) : (Cookie.get("username")));
				//console.log("------------RENDER NAVBAR");
		//let nom_usuari = ((this.userData) ? (this.userData.usuari) : "username");
		let nom_usuari = Cookie.get("username");

		return(
			<>
			<Navbar className="global_navbar" bg="light" expand="md" fixed="top">
				<Container fluid>
					<Navbar.Brand onClick={()=>{this.props.navigate("/")}}>
						<img id="navbar_title_image" src={logo_ViGtory} className="mx-auto d-block" alt="ViGtory!" />
					</Navbar.Brand>
					<Navbar.Toggle aria-controls="navbarScroll" />

					<Navbar.Collapse id="navbarScroll">

						<Nav 
							variant="pills"
							activeKey={this.props.currentSection}
							className="m-auto my-2 my-md-0"
							style={{ maxHeight: '50%' }}
							navbarScroll 
							onSelect={(eventKey) => this.props.navigate(eventKey)}
						>
							<Nav.Link eventKey="/" className="d-flex justify-content-center align-items-center" >Publicacions</Nav.Link>

							<Nav.Link eventKey="/grade_calc" className="d-flex justify-content-center align-items-center" >Calculadora de notes</Nav.Link>

							<Nav.Link eventKey="/schedule_gen" className="d-flex justify-content-center align-items-center" >Generador d'horaris</Nav.Link>




							



						</Nav>




						<NavDropdown 
							align="end"
							title={
								//"elteunomdusuari_peroessuperllarg"
								nom_usuari
								} 
							id="nav-dropdown" 
							className="d-flex" 
							onSelect={
								//this.handleSelect
								(e) => this.handleSelect(e)
								}
						>

								<NavDropdown.Item><Link to={"/user/"+nom_usuari} className="text-reset text-decoration-none d-flex align-items-center">
									<img src={profile_img} className="user_access_icon d-inline" />
									El teu perfil
								</Link></NavDropdown.Item>


								<NavDropdown.Item><Link to="/settings/password" className="text-reset text-decoration-none d-flex align-items-center">
									<img src={settings_img} className="user_access_icon d-inline" />
									Configuració d'usuari
								</Link></NavDropdown.Item>

								<NavDropdown.Divider />

								<NavDropdown.Item eventKey="logout" className="text-reset text-decoration-none d-flex align-items-center">
									<img src={logout_img} className="user_access_icon d-inline" />
									Tanca la sessió
								</NavDropdown.Item>

						</NavDropdown>


					</Navbar.Collapse>
					
				</Container>
			</Navbar>
			<br/>
			</>

		);
	}

}



function NavBar(props){
	//console.log(props.currentSection)


	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}

	//let screen_ref = React.createRef();
	let screen_ref = React.createRef();
	let userData = {};
	let screen = <InitialScreen currentSection={props.currentSection} ref={screen_ref} userData={userData} navigate={navigateTo} />;

	/*useEffect(() => {
		getUserData().then((data) => {
			
			//Cookie.set("username", (data ? data.usuari : "usuari"), 30);
			if (screen_ref.current !== null){
				screen_ref.current.updateData(data);
				console.log("------------ACTUALIZA USERNAME");
			}
		});
	}, []);*/











	return(
		<>
			{screen}
		</>
	)
}
export default NavBar;