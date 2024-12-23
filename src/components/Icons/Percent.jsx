const Percent = ({fill = 'none', stroke = 'black', width, height}) => {
    return ( // Aseguramos el return
        <svg width={width} height={height} viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
            <path d="M19 5L5 19" stroke="#2F27CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 9C7.88071 9 9 7.88071 9 6.5C9 5.11929 7.88071 4 6.5 4C5.11929 4 4 5.11929 4 6.5C4 7.88071 5.11929 9 6.5 9Z" stroke="#2F27CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17.5 20C18.8807 20 20 18.8807 20 17.5C20 16.1193 18.8807 15 17.5 15C16.1193 15 15 16.1193 15 17.5C15 18.8807 16.1193 20 17.5 20Z" stroke="#2F27CE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

export default Percent;