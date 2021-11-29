import React from 'react';


import { Routes, Route, Link, useNavigate } from "react-router-dom";

import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Container, Button } from 'react-bootstrap';
import { Form, FormControl } from 'react-bootstrap';


import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/nav_bar.css';

import '../libraries/cookie';

import logo_ViGtory from '../assets/images/ViGtory_logo.png';
import profile_img from '../assets/images/Profile.png';
import settings_img from '../assets/images/Settings.png';
import logout_img from '../assets/images/Logout.png';






function InitialScreen(props) {

		let navigate = useNavigate();

		function redirectToPage(page) {


			navigate(page);
		}


		function handleSelect(eventKey){
			//alert(`selected ${eventKey}`);
			console.log(`selected ${eventKey}`);
			if (eventKey === "logout"){
				//Borrar cookies de sesión
				navigate("/signin");
			}
		}
		
		//defaultActiveKey="/"
		//justify
		//variant="pills" 
		//variant="tabs" 
		return(

		<Navbar bg="light" expand="md" fixed="top">
			<Container fluid>
				<Navbar.Brand href="/">
					<img id="navbar_title_image" src={logo_ViGtory} className="mx-auto d-block" alt="ViGtory!" />
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="navbarScroll" />

				<Navbar.Collapse id="navbarScroll">

					<Nav 
						variant="pills"
						activeKey={props.currentSection}
						className="m-auto my-3 my-md-0"
						style={{ maxHeight: '50%' }}
						navbarScroll 
						onSelect={(eventKey) => redirectToPage(eventKey)}
					>
						<Nav.Link eventKey="/" className="d-flex justify-content-center align-items-center" >Publicacions</Nav.Link>

						<Nav.Link eventKey="/grade_calc" className="d-flex justify-content-center align-items-center" >Calculadora de notes</Nav.Link>

						<Nav.Link eventKey="/schedule_gen" className="d-flex justify-content-center align-items-center" >Generador d'horaris</Nav.Link>




						



					</Nav>




					<NavDropdown 
						title="elteunomdusuari_peroessuperllarg" 
						id="nav-dropdown" 
						className="d-flex" 
						onSelect={handleSelect}
					>

							<NavDropdown.Item><Link to="/settings" className="text-reset text-decoration-none d-flex align-items-center">
								<img src={profile_img} className="user_access_icon d-inline" />
								El teu perfil
							</Link></NavDropdown.Item>


							<NavDropdown.Item><Link to="/settings" className="text-reset text-decoration-none d-flex align-items-center">
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

		);

}



function NavBar(props){
	//console.log(props.currentSection)
	return(
		<InitialScreen currentSection={props.currentSection} />
	)
}
export default NavBar;