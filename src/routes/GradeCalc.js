import React, { useImperativeHandle } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import {API_address} from '../libraries/API_address';
//import ReactDOM from 'react-dom';
import { Routes, Route, Link, useHistory, useNavigate } from "react-router-dom";

import { Accordion, Button, Form, FloatingLabel, Table, Dropdown, DropdownButton, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';

import NavBar from "../components/NavBar";

import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import '../css/GradeCalc.css';

import { Cookie } from '../libraries/cookie';
import {BaseName} from "../libraries/basename";
import {getSubjectList} from '../libraries/data_request';

//IMPORTANTE PARA QUE NO SE VEA MAL AL ABRIR EL TECLADO EN MÓVIL
//https://stackoverflow.com/questions/32963400/android-keyboard-shrinking-the-viewport-and-elements-using-unit-vh-in-css
var viewport = document.querySelector("meta[name=viewport]");
viewport.setAttribute("content", viewport.content + ", height=" + window.innerHeight);









class MagicInput extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};

		this.inherited_height = 0;
		//this.inherited_width = 0;

		this.readTeditF = true;
		this.read_ref = React.createRef();
		this.edit_ref = React.createRef();
		this.type = this.props.type ? this.props.type : "text"; //o "number"
		this.extra_str = this.props.extra_str ? this.props.extra_str : ""; //%

		this.min = this.props.min ? this.props.min : 0;
		this.max = this.props.max ? this.props.max : 100;
		this.step = this.props.step ? this.props.step : 0.01;

		this.value = (this.props.original_value!=undefined) ? this.props.original_value : "";
		this.updateFunc = this.props.updateFunc ? this.props.updateFunc : (v)=>{};

		this.showEditable = (this.props.showEditable!=undefined) ? this.props.showEditable : true;
		this.editableIndicator = <span className="small" style={{fontSize:"0.60rem", position:"relative", bottom:"0.1rem"}}>✏️</span>;
	}



	manageEditableIcon(){
		let v = this.value;
		if (this.type == "number") v = this.value.toString();
		if (v.length == 0) this.showEditable = true;
		else this.showEditable = (this.props.showEditable!=undefined) ? this.props.showEditable : true;
	}


	
	changeValueRemotely(value){
		if (this.type == "number"){
			value = Math.max(this.min, value);
			value = Math.min(this.max, value);
		}
		if (this.type == "text"){
			value = value.slice(0, this.max);
		}
		this.value = value;
		this.manageEditableIcon();
		this.updateFunc(this.value);
		
		//this.forceUpdate();
	}




	focus(){
		if (this.edit_ref.current){
			this.edit_ref.current.focus();
		}
	}
	/*select(){
		if (this.edit_ref.current){
			this.edit_ref.current.select();
		}
	}*/

	changeToEditMode(){
		setTimeout(()=>{
			this.readTeditF = false;
			this.forceUpdate();
		},10);

		setTimeout(()=>{
			this.focus();
		},20);

		/*setTimeout(()=>{
			this.select();
		},30);*/
	}
	changeToReadMode(){
		setTimeout(()=>{
			this.readTeditF = true;
			this.forceUpdate();
		},30);
	}

	render(){
		//this.inherited_height = 0;
		//console.log(this.value);

		if (this.read_ref.current) this.inherited_height = (this.read_ref.current.offsetHeight > 0) ? this.read_ref.current.offsetHeight : this.inherited_height;

		//else if (this.edit_ref.current) this.inherited_height = (this.edit_ref.current.offsetHeight > 0) ? this.edit_ref.current.offsetHeight : this.inherited_height;

		//if (this.read_ref.current) this.inherited_width = (this.read_ref.current.offsetWidth > 0) ? this.read_ref.current.offsetWidth : this.inherited_width;


		let width = ( 
			(
				this.inherited_height
			*
				(
					(this.type == "number") ? 
						((this.max-1).toString().length + 3)
						:
						(this.value.length)
				)*0.5
			)//.toString()+"px"
		);
		//if (!this.readTeditF) console.log("Width:        "+width);
		//if (!this.readTeditF) console.log("Parent width: "+this.inherited_width); 


		return(<>

			{this.readTeditF ? <>


				<span
					ref={this.read_ref}
					className="magic_input_read"
					onClick={()=>{
						this.changeToEditMode();
					}}
				>
					{(this.type == "number") ? this.value.toString().replace(".",",") : this.value}
					{this.extra_str}
					{this.showEditable?this.editableIndicator:""}
				</span>


			</>:<>


				<Form.Control
					autoFocus
					size="sm"
					className="mb-0 p-0 ps-1 d-inline"
					style={{
						textAlign:"inherit",

						//minWidth:"0",
						//width:"75%",
						minWidth:(Math.max(width, "25")).toString()+"px",
						//maxWidth:this.inherited_width.toString()+"px",
						width:width.toString()+"px",
						//width:Math.min(width, this.inherited_width).toString()+"px",
						//maxWidth:"10px",

						minHeight:"0",
						height:"inherit",

						backgroundColor:"rgba(255,255,255,0)",
						border:"none",
						paddingTop:"-2rem",
						color: "inherit",
						fontSize: "inherit",
						fontWeight: "inherit"
					}}
					ref={this.focusRef}

					type={this.type}

					min={this.min}
					max={this.max}
					step={this.step}

					maxLength={this.max}

					defaultValue={this.value}

					onKeyUp={(e)=>{
						if (e.key === 'Enter' || e.keyCode === 13){
							this.changeToReadMode();
						}
					}}
					onChange={(e)=>{
						if (this.type == "number"){
							e.currentTarget.value = Math.max(this.min, e.currentTarget.value);
							e.currentTarget.value = Math.min(this.max, e.currentTarget.value);
						}
						if (this.type == "text"){
							e.currentTarget.value = e.currentTarget.value.slice(0, this.max);
						}
						this.value = e.currentTarget.value;
						this.manageEditableIcon();
						this.updateFunc(this.value);
						//this.forceUpdate();
					}}
					onBlur={()=>{
						this.changeToReadMode();
					}}
					onFocus={(e)=>{e.currentTarget.select();}}
				/>{this.extra_str}



			</>}




		</>);
	}






}

















class TaulaCalcul extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};
		
		this.maxRows = 50;

		this.taula_nom_ref = React.createRef();
		let taula = this.props.main_ref.current.taules[this.props.index];
		this.row_keys = [];

		this.row_noms_refs = [];
		for (let i=0; i<taula.calculs.length; i++){
			this.row_noms_refs.push(React.createRef());
			this.row_keys.push(this.props.index+"_"+i+"_"+new Date());
		}
		//this.title = <MagicInput ref={this.taula_nom_ref} key={taula.nom} original_value={taula.nom} max={16} updateFunc={(v)=>{taula.nom=v; this.forceUpdate()}} showEditable={false} />
	}



	alphabetize(json_list){
		//return json_list;
		if (!json_list) return [];
		let prop = "sigles_ud";
		return json_list.sort(
			(a, b) => {
				if (a[prop] > b[prop]) {return 1;}
				else if (a[prop] < b[prop]) {return -1;}
				return 0;
			}
		);
	}

	

	title_selector(){
		let taula = this.props.main_ref.current.taules[this.props.index];
		let assignatures = this.alphabetize(this.props.main_ref.current.subjectList.assignatures);

		return(<>

		 
			<DropdownButton
				key={"dropdownbutton"}
				className="d-inline"
				size="sm"
				title={""}
				onSelect={(e)=>{
					//taula.nom = e;
					this.taula_nom_ref.current.changeValueRemotely(e);
					//console.log(taula.nom);
				}}
			>

				{ assignatures ? 
					assignatures.map((v, k) => { 
					return (
						<>
						{k==0 ? "" : <Dropdown.Divider className="my-0" key={k+"_"} /> }
						<Dropdown.Item key={k}
							eventKey={v.sigles_ud}
							className={(taula.nom===v.sigles_ud)?"current_selection":""}
						>
							<b key={k+"b"}>{v.sigles_ud}</b>
							{" "+
							(v.tipus=="OB"?""/*"(obligatòria)"*/:
								((v.tipus=="OP"?"(optativa)":""))
							)}<br key={k+"br"}/>
							&nbsp;&nbsp;&nbsp;
							{"  ⤷ "+v.nom}
						</Dropdown.Item>
						</>
					)
				} ) : "" }

			</DropdownButton>

		</>);
	}


	
	name_selector(index){
		let taula = this.props.main_ref.current.taules[this.props.index];
		let row = taula.calculs[index];

		let parts = this.props.main_ref.current.partList;
		parts = parts.map(part => {

			if (part[part.length-1] == "X"){
				let existing_parts = taula.calculs
				.filter(ro => {
					//return (ro.nom).match(".*\\d+$") ? true : false;
					return (ro.nom).match(part.split("X")[0]+"\\d+$") ? true : false;
				})
				.map(ro => {
					return parseInt(ro.nom.match("\\d+$")[0]);
				})
				existing_parts.push(0);
				existing_parts = existing_parts.sort((a,b)=>a-b)
				
				//console.log(existing_parts);

				let lowest = -1;
				for (let i = 0;  i < existing_parts.length;  ++i) {
					if (existing_parts[i] != i) {
						lowest = i;
						break;
					}
				}
				if (lowest == -1) {
					lowest = existing_parts[existing_parts.length - 1] + 1;
				}

				return part.split("X")[0]+lowest;
			}

			else return part;

		})


		return(<span className="part_selector">

			<DropdownButton
				key={"dropdownbutton"}
				className="d-inline"
				size="sm"
				title={""}
				onSelect={(e)=>{
					//row.nom = e;
					//this.forceUpdate();
					this.row_noms_refs[index].current.changeValueRemotely(e);
				}}
			>

				{ parts ? 
					parts.map((v, k) => { 
					return (
						<>
						{k==0 ? "" : <Dropdown.Divider className="my-0" key={k+"_"} /> }
						<Dropdown.Item key={k}
							eventKey={v}
							className={(row.nom===v)?"current_selection":""}
						>
							<span style={{whiteSpace:"nowrap"}}>
								{((v!="Teoria") && (v!="Pràctica")?<>&nbsp;&nbsp;-&nbsp;</>:"")}{v}
							</span>
						</Dropdown.Item>
						</>
					)
				} ) : "" }
				
			</DropdownButton>

		</span>);
	}





	confirmDeleteTable(){
		return(
			window.confirm(
				"Segur que vols eliminar la taula actual?"+
				"\n  Taula "+//(this.props.index+1)+
				(this.props.main_ref.current.taules[this.props.index].nom ? ": "+this.props.main_ref.current.taules[this.props.index].nom 
				:"sense nom")
			)
		);
	}


	eliminaTaula(needConfirm){
		if (!needConfirm || this.confirmDeleteTable()){
			this.props.main_ref.current.taules.splice(this.props.index, 1);
			this.props.main_ref.current.taules_ref.splice(this.props.index, 1);
			this.props.main_ref.current.saveChanges();
			this.props.main_ref.current.forceUpdate();
		}
	}




	changeAttr(json, attr, val){
		let j = {...json};
		j[attr] = val;
		return j;
	}

	render(){
		let taula = this.props.main_ref.current.taules[this.props.index];



		let header_style = {backgroundColor:"#3488bb", color:"white", width:"auto", /*border:"1px solid #30577b",*/ width:"75%"};

		let nota_final = taula.smartTmanualF ? taula.notaFinal : taula.calculs.reduce((sum, val)=>{return sum+(val.nota*val.percentatge/100)}, 0);

		if (!taula.smartTmanualF){
			nota_final = (nota_final.toFixed(2)%1 > 0) ? nota_final.toFixed(2) : nota_final.toFixed(0);

			taula.notaFinal = nota_final;
		}


		if (taula.smartTmanualF){

			let assolit = taula.calculs.reduce(
				(sum, row)=>
					sum + (row.objectiuTassolitF ? 0 : row.nota*(parseFloat(row.percentatge)/100))
			, 0).toFixed(2);
			//console.log(taula.calculs);
			/*console.log(assolit);
			console.log(taula.notaFinal);*/

			let percentatge_no_assolit = taula.calculs.reduce(
				(sum, row)=>
					sum + (row.objectiuTassolitF ? parseFloat(row.percentatge) : 0)
			, 0).toFixed(2);

			taula.calculs.map((row, i) => {
				if (row.objectiuTassolitF){
					if((parseFloat(assolit) >= parseFloat(taula.notaFinal)) || (row.percentatge==0)){
						row.nota = 0;
						return;
					}

					row.nota = Math.min(10, 
						(taula.notaFinal-assolit)
						*
						(
							(row.percentatge/(percentatge_no_assolit>0?percentatge_no_assolit:0.0001))
							/
							(row.percentatge/100)
						)
						*
						(
							100
							/
							( (row.confianca==0)? 0.0001 : row.confianca )
						)
					);

					row.nota = (row.nota.toFixed(2)%1 != 0) ? row.nota.toFixed(2) : row.nota.toFixed(0);
				}
			})
		}

		let percentatge_total = taula.calculs.reduce(
			(sum, row)=>
				sum + parseFloat(row.percentatge)
		, 0);
		//console.log(percentatge_total);
		percentatge_total = (percentatge_total.toFixed(2)%1 != 0) ? percentatge_total.toFixed(2) : percentatge_total.toFixed(0);



		this.props.main_ref.current.saveChanges();
		return(<>
			<div className="d-flex justify-content-between">
				<h5 className="mb-0 px-2 pt-1 pb-1" style={taula.nom.length>0 ? {backgroundColor:"rgba(11,94,215,1)", color:"white", borderTopLeftRadius:"0.5rem", borderTopRightRadius:"0.5rem"} : {}}>
					<Button
						className="me-1 py-0 px-1 btn-danger"
						size="sm"
						onClick={()=>{
							this.eliminaTaula(true);
						}}
					>
						<b className="py-0">
							<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
						</b>
					</Button>


					<b>
						{
						<MagicInput ref={this.taula_nom_ref} /*key={taula.nom}*/ original_value={taula.nom} max={16} updateFunc={(v)=>{taula.nom=v; this.forceUpdate()}} showEditable={false} />
						//this.title
						}
						{this.title_selector()}
					</b>
				</h5>


				<Button
					className="py-0 px-1 me-3 mb-1 small"
					size="sm"
					onClick={()=>{
						taula.smartTmanualF = !(taula.smartTmanualF);
						this.forceUpdate();
					}}
				>
						<h6 className="d-inline">{taula.smartTmanualF ? "☑":"☐"}</h6>
						&nbsp;
						<span className="small" >{"Mode intel·ligent"}</span>
				</Button>
			</div>
			


			<Table className="mb-0" style={{tableLayout:"fixed", width:"100%", borderCollapse:"collapse", borderStyle:"none !important", borderBottomLeftRadius:"0.75rem", borderTopRightRadius:"0.75rem !important", overflowX:"hidden"}}>

				<thead>
					<tr>
						<th style={this.changeAttr(header_style, "width", taula.smartTmanualF ?"30%":"50%")}>
							{"Part"}
						</th>


						<th style={this.changeAttr(header_style, "width", "20%")}>
							{"Percent"}
						</th>

						{taula.smartTmanualF ? 

							<th style={this.changeAttr(header_style, "width", "20%")}>

								<OverlayTrigger
									overlay={
										<Tooltip className="text-center mb-2">
											{"La confiança que tens en treure exactament (o més) la nota que et proposem."}
											<br/><br/>
											{"Si, per exemple, amb la confiança al 100% necessitessis un 4; amb la confiança al 50% t'hauries d'esforçar com per a aconseguir un 8."}
										</Tooltip>
									}
									>


									<span style={{borderBottom:"1px dotted"}/*{textDecoration:"underline dotted"}*/} >
										{"Confiança"}
									</span>


								</OverlayTrigger>

							</th>
						:""}
						

						<th style={this.changeAttr(header_style, "width", "15%")}>
							{"Objectiu"}
						</th>


						<th style={this.changeAttr(
									this.changeAttr(header_style, "width", "15%")
									,"borderTopRightRadius", "0.75rem"
									)}>
							{"Nota"}
						</th>

					</tr>
				</thead>


				<tbody>
					{taula.calculs.map((row, i) => {return(<>

						<tr style={{backgroundColor:"white"}} key={this.row_keys[i]}>
							<td key={this.props.index+"_"+i+"_"+((i===(taula.calculs.length-1))?"last":"not_last")} className="ps-1 align-middle" style={{wordWrap:"break-word", borderBottomLeftRadius:((i===(taula.calculs.length-1))?"0.75rem":"0")}}>
								<Button
									className="me-1 py-0 px-1 btn-danger"
									size="sm"
									onClick={()=>{
										if ((taula.calculs.length-1) == 0)
											if (!this.confirmDeleteTable()) return;

										taula.calculs.splice(i, 1);
										this.row_keys.splice(i, 1);
										if (taula.calculs.length == 0) this.eliminaTaula(false);
										else this.forceUpdate();
									}}
								>
									<b className="py-0">
										<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
									</b>
								</Button>



								<MagicInput ref={this.row_noms_refs[i]} /*key={row.nom}*/ original_value={row.nom} max={32} updateFunc={(v)=>{row.nom = v; this.forceUpdate()}} showEditable={false} />{this.name_selector(i)}
							</td>


							<td className="text-center align-middle">
								<b>
								<MagicInput original_value={row.percentatge} type={"number"} updateFunc={(v)=>{row.percentatge = v; this.forceUpdate()}} extra_str="%" />
								</b>
							</td>


							{taula.smartTmanualF ? 
								<td className="text-center align-middle">
									{row.objectiuTassolitF ? 
										<MagicInput original_value={row.confianca} type={"number"} updateFunc={(v)=>{row.confianca = v; this.forceUpdate()}} extra_str="%" />
									:
										<>{"100%"}</>
									}
								</td>
							:""}



							<td className="text-end align-middle">
								<span className="magic_input_read" onClick={()=>{row.objectiuTassolitF=!row.objectiuTassolitF; this.forceUpdate()}} style={{cursor:"pointer"}}>
									{row.objectiuTassolitF ? "Vull un" : "Tinc un"}
								</span>
							</td>


							<td className="align-middle" style={{whiteSpace:"nowrap"}}>
								<b>
								{
									( (row.nota).toString().split(".")[0].length==1 ) ? <>&nbsp;</> : ""
								}
								{(row.objectiuTassolitF && taula.smartTmanualF) ? 
									<span className="result_read">&nbsp;{row.nota.toString().replace(".",",")}&nbsp;</span>
								:
									<MagicInput original_value={row.nota} type={"number"} updateFunc={(v)=>{row.nota = v; this.forceUpdate()}} max={10} />
								}
								</b>
							</td>

						</tr>
						
						

					</>);})}







					<tr style={{borderBottomStyle:"hidden"}}>
						<td className="pt-0 px-0 text-center" colSpan={taula.smartTmanualF ? "3":"2"}>
						{taula.calculs.length < this.maxRows ? <>
								<Button
									className="py-0"
									style={{borderTopLeftRadius:"0", borderTopRightRadius:"0", width:"85%"}}
									onClick={()=>{
										taula.calculs.push(
											{
												nom: "???",
												percentatge: (percentatge_total < 100)?(100-percentatge_total).toFixed(2) : 0,
												nota: 5,
												confianca: 100,
												objectiuTassolitF: true
											}
										);
										this.row_noms_refs.push(React.createRef());
										this.row_keys.push(this.props.index+"_"+(taula.calculs.length-1)+"_"+new Date());
										this.forceUpdate();
										//this.row_noms_refs[taula.calculs.length-2].current.forceUpdate();
									}}
								>
									<b>
										<span style={{fontFamily: "monospace", fontSize: "1rem"}}>+</span>
										&nbsp;
										<span className="small" >{"Nova part"}</span>
									</b>
								</Button>

								<br/>
							</>:""}

							<span
								style={{color:"red"}}
							>{(percentatge_total == 100) ? "" : <>
								{"Els percentatges no sumen 100% ("+(percentatge_total.toString().replace(".",","))+"%)."}
								</>}</span>
						</td>


						

						<td className="text-end align-middle" style={{backgroundColor:"white", borderBottomLeftRadius:"0.75rem"}}>
							<b>{"Nota final:"}</b>
						</td>


						<td className="align-middle" style={{whiteSpace:"nowrap", backgroundColor:"white", borderBottomRightRadius:"0.75rem"}}>
							<h6 className="mb-0">
							<b>

								{(!taula.smartTmanualF) ? 
									<span className="result_read">&nbsp;{nota_final.replace(".",",")
										//((nota_final.toFixed(2)%1 != 0) ? nota_final.toFixed(2) : nota_final.toFixed(0)).toString().replace(".",",")
										}&nbsp;</span>
								:
									<MagicInput 
										original_value={nota_final} 
										type={"number"} 
										updateFunc={(v)=>{
											taula.notaFinal = v;
											this.forceUpdate()
										}} 
										max={10} 
									/>
								}


								
							</b>
							</h6>
						</td>

					</tr>











				


				</tbody>
			</Table>

				<br/><br/><br/>

		</>);
	}


}
















class InitialScreen extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
		};

		this.maxTaules = 20;

		
		this.taules = [];
		this.taules_ref = [];


		this.subjectList = [];
		this.partList = [
			"Teoria",
			"Ex. Parcial X",
			"Ex. Final",
			"Pràctica",
			"Pràctica X",
		]
	}



	componentDidMount(){
		let local_saved_taules = JSON.parse(window.localStorage.getItem(
			"grade_calc"+"___"+Cookie.get("jwt")
			));
		//console.log(local_saved_taules);
		this.taules = local_saved_taules ? [...local_saved_taules.taules] : [];
		//console.log(this.taules[0]);



		this.taules_ref = [];
		for (let i=0; i<this.taules.length; i++){
			this.taules_ref.push(React.createRef());
		}
		//console.log(this.taules_ref);

		this.forceUpdate();
	}


	saveChanges(){
		//console.log(JSON.stringify(this.taules));
		window.localStorage.setItem(
			"grade_calc"+"___"+Cookie.get("jwt")
			,
			JSON.stringify({taules:this.taules})
		)
	}

	eliminaTotesLesTaules(){
		for (let i=this.taules_ref.length-1; i>=0; i--){
			this.taules_ref[i].current.eliminaTaula(false);
		}
	}

	updateSubjectList(data){
		this.subjectList = data;
		this.forceUpdate();
	}

	
	render(){


		let btn_delete_all = ((this.taules.length==0) ? "" : 
			<p className="text-center" style={{position:"sticky", top:"3.5rem"}}>
				<Button
					className="py-0 btn-danger"
					onClick={()=>{
						if (window.confirm(
							"Segur que vols eliminar totes les taules actuals?"
						))
							this.eliminaTotesLesTaules();
					}}
				>
					<b>
					<span style={{fontFamily: "monospace", fontSize: "1rem"}}>✖</span>
					&nbsp;
					{"Elimina-ho tot"}
					</b>
				</Button>
				<br/><br/><br/>

			</p>
		);
	

		
		return(
			<>
				<NavBar currentSection={this.props.currentSection} />
				<br/><br/><br/><br/>

				<div className="grade_calc mx-auto" >
				
					<h2 className="text-center mb-4">Calculadora de notes:</h2>



					{btn_delete_all}



					{this.taules.map((taula, i) => {
						// saveChanges={()=>{this.saveChanges();}}
						return(<>
							<TaulaCalcul main_ref={this.props.main_ref} index={i} ref={this.taules_ref[i]} />
							<br/>
						</>);
					})}




					{this.taules.length < this.maxTaules ? 
						<p className="text-center">
							<Button
								className="py-0"
								onClick={()=>{
									this.taules.push({
										nom: "Assignatura",
										smartTmanualF: (this.taules.length>0) ? this.taules[this.taules.length-1].smartTmanualF : true,
										notaFinal: (this.taules.length>0) ? this.taules[this.taules.length-1].notaFinal : 5,
										calculs: [
											{
												nom: "Teoria",
												percentatge: 40,
												confianca: 100,
												nota: 7,
												objectiuTassolitF: false
											},
											{
												nom: "Pràctica",
												percentatge: 60,
												confianca: 100,
												nota: 9,
												objectiuTassolitF: true
											}
										]
									});
									this.taules_ref.push(React.createRef());
									this.saveChanges();
									this.forceUpdate();
								}}
							>
								<b>
									<span style={{fontFamily: "monospace", fontSize: "1.5rem"}}>+</span>
									&nbsp;
									{"Nova taula"}
								</b>
							</Button>
							<br/><br/>

						</p>
					:""}
					


				</div>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
				<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
			</>
		);

	};
}



function GradeCalc(props){
	//ESTE TROZO DE CÓDIGO EXPULSA AL USUARIO SI INTENTA CARGAR UNA PÁGINA SIN ESTAR LOGUEADO
	if (!Cookie.get("jwt")){
		window.location.href = 
			window.location.protocol+"//"+window.location.host+
			(BaseName==="/"?"":BaseName) + "/signin";
	}



	document.title = "ViGtory! Calculadora de notes";


	let navigate = useNavigate();
	function navigateTo(page) {
		navigate(page);
	}
	useEffect(() => {
		getSubjectList().then((data) => {
			//console.log(data);
			if (main_ref.current)
			main_ref.current.updateSubjectList(data);
		});
	  }, [window.location.href && new Date()]);

	let main_ref = React.createRef();

	return(
		<InitialScreen currentSection={props.currentSection} key={"grade_calc_"+(new Date().toString())} ref={main_ref} main_ref={main_ref} />
	)
}
export default GradeCalc;