const Admin = require('../models/Admin');
const Driver = require('../models/Driver');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const createJWT = require('../utils/auth');

const signinDriver = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error('Please enter all fields');
  }

  try {
    const driver = await Driver.findOne({ email: email });

    if (!driver) {
      throw new Error('Email not Found');
    } else {
      const isMatch = await bcrypt.compare(password, driver.password);

      if (!isMatch) {
        throw new Error('Incorrect Email or Password');
      } else {
        const token = createJWT(res, driver.email, driver._id, driver.role);

        res.status(200).json({
          _id: driver._id,
          firstName: driver.firstName,
          lastName: driver.lastName,
          licenseNumber: driver.licenseNumber,
          nationalId: driver.nationalId,
          contactNumber: driver.contactNumber,
          email: driver.email,
          homeAddress: driver.homeAddress,
          licenseExpiryDate: driver.licenseExpiryDate,
          role: driver.role,
          token: token,
        });
      }
    }
  } catch (err) {
    throw new Error(err.message);
  }
});

// Logout user
const logout = asyncHandler(async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'development' ? true : false,
    });
    res.status(200).json({ message: 'User Logged out'});
  } catch (err) {
    res.status(500);
    throw new Error('Internal server error');
  }
});

const signinAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error('Please enter all fields');
  }

  try {
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      throw new Error('Admin Not Found');
    } else {
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        throw new Error('Incorrect Email or Password');
      } else {
        const token = createJWT(res, admin.email, admin._id, admin.role);
        res.status(200).json({
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          contactNo: admin.contactNo,
          role: admin.role,
          token: token,
        });
      }
    }
  } catch (err) {
    throw new Error(err.message);
  }
});

module.exports = {
  signinDriver,
  signinAdmin,
  logout,
};