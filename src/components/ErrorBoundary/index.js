import React from 'react';
import { Component } from "react";
import NotFound from "../../pages/NotFound";
import {SECRET_KEY} from "../../constants/index"
class ErrorBoundary extends React.Component {

	// componentWillMount() {
	// 	const tetchTokenInLocalStorage = localStorage.getItem(SECRET_KEY)
	// 	console.log("My console for component will mount", tetchTokenInLocalStorage, tetchTokenInLocalStorage === null)
	// 	if(tetchTokenInLocalStorage === null){
	// 		window.location.href = "/"
	// 	}
	// }

	state = {
		hasError: false,
		error: { message: '', stack: '' },
		info: { componentStack: '' }
	};
  
	static getDerivedStateFromError = error => {
		console.log("has error :::::::: getDerivedStateFromError stringform",error)
		console.log("has error :::::::: getDerivedStateFromError",error.toString())
	  	return { hasError: true };
	};
  
	componentDidCatch = (error, info) => {
		console.log("error ::::::::::::::: ",error)
		console.log("infor :::::::::::::::::: ",info)
		this.setState({ error, info });
	};
  
	render() {
		const { hasError, error, info } = this.state;
		const { children } = this.props;

		console.log("hasError :::::::: ",hasError)
		console.log("error :::::::: ",error)
		console.log("info ::::::::: ",info)
		console.log("children :::::: ",children)
		if(hasError){
			console.log("inside has error if ::::")
			const tetchTokenInLocalStorage = localStorage.getItem(SECRET_KEY)
			console.log("tetchTokenInLocalStorage found or not", tetchTokenInLocalStorage, tetchTokenInLocalStorage === null)
			if(tetchTokenInLocalStorage === null){
				window.location.href = "/"
			}else{
				window.location.href = '/NotFound'
			}
		}
		else{
			return children
		}
		// return hasError ? window.location.href = '/NotFound' : children;
	}
  }

  export default ErrorBoundary;