import { useEffect, useId, useRef, useState } from 'react';
import RenderIf from '../../utils/React/RenderIf';
import { AiOutlineEyeInvisible, AiOutlineEye } from 'react-icons/ai';

export default function Input({
  labelActive,
  required = true,
  label,
  icon,
  disabled,
  type,
  value,
  customState,
  className = '',
  style,
  placeholder,
}) {
  const labelRef = useRef();
  const inputRef = useRef();
  const inputId = useId();
  const [content, setContent] = customState || useState(value || '');
  const [isPwPeeked, setIsPwPeeked] = useState(false);

  const emptyClasses =
    'text-xs peer-focus:text-xxs text-gray-700 peer-focus:text-gray-500 translate-y-full peer-focus:translate-y-0 duration-200 cursor-text';
  const notEmptyClasses = 'text-xxs text-gray-500 duration-200 cursor-text';

  // for peeking password
  useEffect(() => {
    if (!inputRef) return;
    if (type === 'password') {
      inputRef.current.type = isPwPeeked ? 'text' : 'password';
    }
  }, [isPwPeeked]);

  // for moving label to the top left corner when user is typing
  useEffect(() => {
    if (!labelRef.current) return;
    const cl = labelRef.current;
    const currentClasses = [...cl.classList].join(' ');

    if (!labelActive) {
      if (content !== '') {
        if (currentClasses !== notEmptyClasses) cl.className = notEmptyClasses;
      } else {
        if (currentClasses !== emptyClasses) cl.className = emptyClasses;
      }
    } else {
      cl.className = notEmptyClasses;
    }
  }, [labelRef, content]);

  return (
    <div className="flex flex-col-reverse w-full">
      <RenderIf conditionIs={type === 'text' || type === 'email'}>
        <input
          autoComplete="new-password"
          style={style}
          required={required}
          ref={inputRef}
          placeholder={placeholder}
          className={`text-gray-800 disabled:text-gray-500 bg-transparent mt-1 outline-none border-b-2 peer border-slate-400 focus:border-pink-400 duration-200 ${className}`}
          type={type}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled}
          value={content}
          id={inputId}
        />
      </RenderIf>
      <RenderIf conditionIs={type === 'password'}>
        <div className="relative flex flex-col-reverse w-full">
          <button
            type="button"
            className="absolute right-2 bottom-1 z-10 cursor-pointer text-xl"
            onClick={() => setIsPwPeeked(!isPwPeeked)}
          >
            <RenderIf conditionIs={isPwPeeked}>
              <AiOutlineEye className="text-blue-400" />
            </RenderIf>
            <RenderIf conditionIs={!isPwPeeked}>
              <AiOutlineEyeInvisible />
            </RenderIf>
          </button>
          <input
            autoComplete="new-password"
            style={style}
            required={true}
            ref={inputRef}
            placeholder={placeholder}
            className={`text-gray-800 disabled:text-gray-500 bg-transparent mt-1 outline-none border-b-2 peer border-slate-400 focus:border-pink-400 duration-200 w-full pr-10 ${className}`}
            type="password"
            onChange={(e) => setContent(e.target.value)}
            disabled={disabled}
            id={inputId}
          />
          <label
            className="text-xs peer-focus:text-xxs text-gray-700 peer-focus:text-gray-500 translate-y-full peer-focus:translate-y-0 duration-200 cursor-text gap"
            style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}
            htmlFor={inputId}
            ref={labelRef}
          >
            {icon}
            <span>{label}</span>
          </label>
        </div>
      </RenderIf>
      <RenderIf
        conditionIs={type !== 'email' && type !== 'password' && type !== 'text'}
      >
        <input
          autoComplete="new-password"
          style={style}
          required={required}
          ref={inputRef}
          placeholder={placeholder}
          type={type}
          className={className}
          onChange={(e) => setContent(e.target.value)}
          disabled={disabled}
          value={content}
          id={inputId}
        />
      </RenderIf>

      {/* render label */}
      <RenderIf conditionIs={!type || type !== 'password'}>
        <label
          className="text-xs peer-focus:text-xxs text-gray-700 peer-focus:text-gray-500 translate-y-full peer-focus:translate-y-0 duration-200 cursor-text gap"
          style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}
          htmlFor={inputId}
          ref={labelRef}
        >
          {icon}
          <span>{label}</span>
        </label>
      </RenderIf>
    </div>
  );
}
