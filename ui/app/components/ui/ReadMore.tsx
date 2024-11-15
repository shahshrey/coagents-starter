import React, { useState } from 'react';

function ReadMore({ text }: any) {
  const [showMore, setShowMore] = useState(false);

  const toggleReadMore = () => {
    setShowMore(!showMore);
  };

  return (
    <div>
      {!showMore && <p style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {text}
      </p>}

      {showMore && <p>{text}</p>}

      {text.length > 100 && (
        <a
          onClick={toggleReadMore}
          href="javascript:void(0)"
          className="inline-block mt-2 text-blue-500 hover:text-blue-600 transition-colors"
        >
          {showMore ? 'Read Less' : 'Read More'}
        </a>
      )}
    </div>
  );
}

export default ReadMore;