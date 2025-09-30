import mongoose from 'mongoose';

interface IToken {
  token: string,
}

interface IUser {
  name: string,
  email: string,
  password: string,
  tokens: IToken[]
}

const UserSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    minlength: [2, 'The minimum length of the "name" field is 2'],
    maxlength: [30, 'The maximum length of the "name" field is 30'],
    default: 'Ё-моё',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'The minimum length of the "password" field is 6'],
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
