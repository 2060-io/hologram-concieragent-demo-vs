import React from 'react';

export default function Image({url, floating, caption, maxWidth, align, border}) {
  return (
    
    <figure 
    style={{
      textAlign: align,
      fontStyle: 'italic',
      fontSize: 'smaller',
      textIndent: '0',
      marginTop: '0.5em',
      marginBottom: '0.7em',
      marginRight: '0.5em',
      marginLeft: '0.5em',
      padding: '0.5em',
      float: floating,
    }}
      >
    
    <img
      src = { url }
      
      style={{
        maxWidth: maxWidth,
        border: border,
        //border: '1px solid #DDDDDD', 
        marginTop: '0.5em',
        marginBottom: '0.3em',
        marginRight: '0.5em',
        marginLeft: '0.5em',
      }}
      
      />
    <figcaption>{ caption }</figcaption>
    </figure> 
   
  );
}

