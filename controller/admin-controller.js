const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

module.exports = getAllUsers;
