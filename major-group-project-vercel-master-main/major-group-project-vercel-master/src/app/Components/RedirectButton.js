// RedirectButton.js
import React from 'react';
import { useRouter } from 'next/navigation';

//RedirectButton with "destination" and "text" props passed through
const RedirectButton = ({ destination, text }) => {
  //Use Next Router
  const router = useRouter();

  //Send user to destination page when clicked
  const handleClick = (e) => {
    e.preventDefault();
    //Push to destination page
    router.push(destination);
  };

  //Component Content
  return (
    <a href={destination} onClick={handleClick}>
    {text}
    </a>
  );
};

//Export component so it can be used later
export default RedirectButton;
