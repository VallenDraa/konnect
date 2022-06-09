import UserModel from '../../model/User.js';

export const register = async (req, res, next) => {
  const { username, password, email } = req.body;

  try {
    const newUser = await UserModel.create({
      username,
      password,
      email,
    });

    res.json(newUser);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    console.log(user);
  } catch (error) {
    next(error);
  }
};
