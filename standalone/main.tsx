import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';
import './standalone.css';
createRoot(document.getElementById('root')!).render(<Home/>);
