import { useEffect, useRef, useState } from 'react';

export const Input = ({ label, innerRef }) => {
  const labelRef = useRef();
  const [content, setContent] = useState('');

  const emptyClasses =
    'text-xs peer-focus:text-xxs text-gray-700 peer-focus:text-gray-500 translate-y-full peer-focus:translate-y-0 duration-200 cursor-text';
  const notEmptyClasses = 'text-xxs text-gray-500 duration-200 cursor-text';

  useEffect(() => {
    if (!labelRef.current) return;
    const cl = labelRef.current;

    if (content !== '') {
      if ([...cl.classList].join(' ') !== notEmptyClasses) {
        cl.className = notEmptyClasses;
      }
    } else {
      if ([...cl.classList].join(' ') !== emptyClasses) {
        cl.className = emptyClasses;
      }
    }
  }, [labelRef, content]);

  return (
    <div className="flex flex-col-reverse">
      <input
        required
        ref={innerRef}
        className="bg-transparent outline-none border-b-2 peer border-slate-400 focus:border-pink-400 duration-200"
        type="text"
        onChange={(e) => setContent(e.target.value)}
        value={content}
        name={label}
        id={label}
      />

      <label
        className="text-xs peer-focus:text-xxs text-gray-700 peer-focus:text-gray-500 translate-y-full peer-focus:translate-y-0 duration-200 cursor-text"
        htmlFor={label}
        ref={labelRef}
      >
        {label}
      </label>
    </div>
  );
};
