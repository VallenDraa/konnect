import Input from '../../../Input/Input';

export default function PasswordConfirmation({ setIsPasswordConfirm }) {
  return (
    <form
      autoComplete="new-password"
      className="flex flex-col justify-between grow text-center"
    >
      <h3 className="font-semibold pt-3 text-sm sm:text-base">
        Enter Password To Change
      </h3>
      <div className="w-full px-5">
        <Input type="password" />
      </div>
      <div className="border-t-4 flex w-full divide-x-2 h-10">
        <button
          className="basis-1/2 h-full hover:bg-pink-400 hover:text-white text-pink-400 font-light duration-200 rounded-bl-xl"
          type="button"
          onClick={() => setIsPasswordConfirm(false)}
        >
          Cancel
        </button>
        <button
          className="basis-1/2 h-full hover:bg-blue-400 hover:text-white text-blue-400 font-light duration-200 rounded-br-xl"
          type="submit"
        >
          Change
        </button>
      </div>
    </form>
  );
}
