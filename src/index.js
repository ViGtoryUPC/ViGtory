import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import { Button } from 'react-bootstrap';

import SignInUp from "./routes/SignInUp";
import ProfileSettings from "./routes/ProfileSettings";
import UserProfile from "./routes/UserProfile";
import Home from "./routes/Home";
import GradeCalc from "./routes/GradeCalc";
import ScheduleGen from "./routes/ScheduleGen";
//import NavBar from "./components/NavBar";
import {BaseName} from "./libraries/basename";






// ========================================

//MUY IMPORTANTE PARA QUE LAS RUTAS FUNCIONEN EN GITHUB: https://github.com/rafgraph/spa-github-pages

let home_ref = React.createRef();
let user_home_ref = React.createRef();

//<SignInUp loginTregisterF={false} />
ReactDOM.render(
<React.StrictMode>
	<BrowserRouter basename={BaseName}>
		<Routes>

			<Route path="/" element={<Home currentSection="/" home_ref={home_ref} />} />



			<Route path="signin" element={<SignInUp loginTregisterF={true} />} />

			<Route path="signup" element={<SignInUp loginTregisterF={false} />} />

			
			<Route path="settings/:section" element={<ProfileSettings />} />
			{
			//<Route path="settings" element={<ProfileSettings currentSection="username" />} />
			//<Route path="settings/username" element={<ProfileSettings currentSection="username" />} />
			
			/*<Route path="settings/password" element={<ProfileSettings currentSection="password" />} />
			<Route path="settings/mail" element={<ProfileSettings currentSection="mail" />} />
			<Route path="settings/mail_student" element={<ProfileSettings currentSection="mail_student" />} />
			<Route path="settings/degree" element={<ProfileSettings currentSection="degree" />} />
			*/
			//<Route path="settings/delete_account" element={<ProfileSettings currentSection="delete_account" />} />
			}
			<Route path="user/:username" element={<Home currentSection="/" home_ref={user_home_ref} />} />
			{
				//<Route path="user/:username" element={<UserProfile />} />
			}



			<Route path="grade_calc" element={<GradeCalc currentSection="/grade_calc" />} />

			<Route path="schedule_gen" element={<ScheduleGen currentSection="/schedule_gen" />} />







			<Route
				path="*"
				element={
					<main style={{ padding: "1rem" }}>
						<p className="text-center">
							<br/><br/>
							La pàgina a què intentes accedir està buida.
							<br/><br/><br/>
							Tornar a l'inici?
							<br/><br/>
							<Link to="/"><Button>Pàgina principal</Button></Link>
						</p>
					</main>
				}
			/>

		</Routes>
  	</BrowserRouter>
</React.StrictMode>,
	document.getElementById('root')
);
