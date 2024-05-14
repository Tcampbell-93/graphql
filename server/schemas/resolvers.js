import { User } from '../models/index';
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id }).populate('Book');
            }
            throw AuthenticationError;
        },
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
        
            if (!user) {
                throw AuthenticationError;
            }
        
            const correctPw = await user.isCorrectPassword(password);
        
            if (!correctPw) {
                throw AuthenticationError;
            }
        
            const token = signToken(user);
        
            return { token, user };
        },
        saveBook: async (_, { bookInput }, { user }) => {
            try {
              const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: bookInput } },
                { new: true, runValidators: true }
              );
              return updatedUser;
            } catch (err) {
              throw new Error(err.message);
            }
        },
        deleteBook: async (_, { bookId }, { user }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { _id: bookId } } },
                { new: true }
            );
            if (!updatedUser) {
                throw new Error("Couldn't find user with this id!");
            }
            return updatedUser;
        },
    }
}

module.exports = resolvers;