import React from 'react';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { useNavigate, useLocation, Link } from "react-router-dom";

import { Pagination } from 'react-bootstrap';


import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/ViGtPagination.css';






function newParamsPage(params, new_p){
	//Recibimos un objeto URLSearchParams y devolvemos una copia con el parámetro p cambiado

	let params_ = new URLSearchParams(params.toString());
	params_.set("p", new_p);

	return params_;
}







class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		//this.state = {};
	}

	
	render(){
		let o_limit = 3;
		let limit = Math.min(o_limit, Math.max(1, (o_limit*2)-(String(this.props.current_p+o_limit).length)) );
		let min = this.props.current_p-limit;
		min = Math.max(1, min);
		let max = this.props.current_p+limit;
		max = Math.min(max, this.props.last_p);

		let params = new URLSearchParams(window.location.search);

		let linkstyle = "text-reset text-decoration-none d-flex align-items-center"
		
		
		//console.log(this.props.params.get("p"));

		//console.log(min);
		//console.log(max);

		
		
		return(
			<>
				<Pagination  size="sm" className="vig_pagination mx-auto d-flex justify-content-center">


				{ (Array.from({length: max-min+1}, (v,k) => k+min)).map((v,k) => { 
					//console.log(k);
					//console.log(this.props.params.toString());
					//let params = new URLSearchParams(this.props.params.toString());


					//console.log(this.props.location);
					//<Link to="/settings/password">


					//Esto se usaría dentro de Pagination.X pero hace conflicto con Link, así que usaremos una alternativa
					//active={v==this.props.current_p}

					let visual = (v==this.props.current_p) ? " visual_active" : " visual_inactive";

					let smooth_scroll_to_top = ()=>{
						if (v!=this.props.current_p){
							//SMOOTH SCROLL TO TOP
							document.querySelector("#new_post_btn").scrollIntoView({behavior: 'smooth'});
						}
					}

					return (<>


						{v==min ? 
							<Link to={this.props.location+"?"+newParamsPage(params, 1)} className={linkstyle+" me-3"+visual} onClick={()=>{smooth_scroll_to_top()}} >
								<Pagination.First 
								key={/*1*/0} 
								title={1}
								active />
							</Link>
						: <></>}


						<Link to={this.props.location+"?"+newParamsPage(params, v)} className={linkstyle+((limit<=o_limit) ? " me-1":" mx-1")+visual} onClick={()=>{smooth_scroll_to_top()}} >
							<Pagination.Item 
								key={v} 
								active
							>{v}</Pagination.Item>
						</Link>


						{v==max ? 
							<Link to={this.props.location+"?"+newParamsPage(params, this.props.last_p)} className={linkstyle+((limit<=o_limit) ? " ms-3":" ms-3")+visual} onClick={()=>{smooth_scroll_to_top()}} >
								<Pagination.Last 
								key={/*this.props.last_p*/-1} 
								title={this.props.last_p}
								active />
							</Link>
						: <></>}


						</>
					);
				} ) }
						
					

				</Pagination>
			</>
		);

	};
}






function ViGtPagination(props){

	const location = useLocation();
	let loc = location.pathname;
	//console.log(loc);

	return(
		<InitialScreen current_p={props.current_p} last_p={props.last_p} location={loc} />
	)
}
export default ViGtPagination;