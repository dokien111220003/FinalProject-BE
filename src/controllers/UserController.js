const UserService = require("../services/UserService");
const JwtService = require("../services/JwtService");
const User = require("../models/UserModel");

const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    const exisitingUSer = await User.findOne({ email });
    if (!email || !password || !confirmPassword) {
      return res.status(500).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: "ERR",
        message: "The input is email",
      });
    } else if (password !== confirmPassword) {
      return res.status(500).json({
        status: "ERR",
        message: "The password is equal confirmPassword",
      });
    }
    if (exisitingUSer) {
      return res.status(500).send({
        success: false,
        message: "email already taken",
      });
    }
    const response = await UserService.createUser(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    
    if (!email || !password) {
      return res.status(400).json({
        status: "ERR",
        message: "The input is required",
      });
    } else if (!isCheckEmail) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid email format",
      });
    }

    const response = await UserService.loginUser(req.body);
    if (response.status === "ERR") {
      return res.status(401).json(response);
    }

    // Lấy thông tin user từ database
    const user = await User.findOne({ email });
    
    // Thêm thông tin về quyền vào response
    const { refresh_token, ...newResponse } = response;
    const responseWithRoles = {
      ...newResponse,
      data: {
        isAdmin: user.isAdmin,
        isProductManage: user.isProductManage,
        isOrderManage: user.isOrderManage
      }
    };

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    return res.status(200).json({ ...responseWithRoles, refresh_token });
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: "An error occurred on the server",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.updateUser(userId, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const deleteMany = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!ids) {
      return res.status(200).json({
        status: "ERR",
        message: "The ids is required",
      });
    }
    const response = await UserService.deleteManyUser(ids);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "ERR",
        message: "The userId is required",
      });
    }
    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    let token = req.headers.token.split(" ")[1];
    if (!token) {
      return res.status(200).json({
        status: "ERR",
        message: "The token is required",
      });
    }
    const response = await JwtService.refreshTokenJwtService(token);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, address, isProductManage, isOrderManage } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    const existingUser = await User.findOne({ email });

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        status: "ERR",
        message: "Name, email and password are required",
      });
    }
    
    if (!isCheckEmail) {
      return res.status(400).json({
        status: "ERR",
        message: "Invalid email format",
      });
    }

    if (existingUser) {
      return res.status(400).json({
        status: "ERR",
        message: "Email already exists",
      });
    }

    if (!isProductManage && !isOrderManage) {
      return res.status(400).json({
        status: "ERR",
        message: "At least one role must be selected",
      });
    }

    const response = await UserService.createStaff({
      name,
      email,
      password,
      phone,
      address,
      isProductManage,
      isOrderManage
    });
    
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      status: "ERR",
      message: e.message,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
  deleteMany,
  createStaff,
};
