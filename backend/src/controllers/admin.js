const User = require("../models/User");
const Order = require("../models/Order");

const getUsersByAdmin = async (req, res) => {
	try {
		const { limit = 10, page = 1, search = "" } = req.query;

		const skip = parseInt(limit) * (parseInt(page) - 1) || 0;

		// Constructing nameQuery based on search input
		const nameQuery = search
			? {
					$or: [
						{ firstName: { $regex: search, $options: "i" } },
						{ lastName: { $regex: search, $options: "i" } },
						{ email: { $regex: search, $options: "i" } },
					],
			  }
			: {};

		const totalUserCounts = await User.countDocuments(nameQuery);

		const users = await User.find(nameQuery, null, {
			skip: skip,
			limit: parseInt(limit),
		}).sort({
			createdAt: -1,
		});

		return res.status(200).json({
			success: true,
			data: users,
			count: Math.ceil(totalUserCounts / parseInt(limit)),
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};
const getOrdersByUid = async (req, res) => {
	try {
		const id = req.params.id;
		const { limit = 10, page = 1 } = req.query;

		const skip = parseInt(limit) * (parseInt(page) - 1) || 0;

		const currentUser = await User.findById(id);

		const totalOrders = await Order.countDocuments({ "user._id": id });

		const orders = await Order.find({ "user._id": id }, null, {
			skip: skip,
			limit: parseInt(limit),
		}).sort({
			createdAt: -1,
		});

		if (!currentUser) {
			return res
				.status(404)
				.json({ success: false, message: "User Not Found" });
		}

		return res.status(200).json({
			success: true,
			user: currentUser,
			orders,
			count: Math.ceil(totalOrders / parseInt(limit)),
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};

const UpdateRoleByAdmin = async (req, res) => {
	try {
		const id = req.params.id;
		const userToUpdate = await User.findById(id);

		if (!userToUpdate) {
			return res
				.status(404)
				.json({ success: false, message: "User Not Found." });
		}

		// Check if the user to update is a super admin
		if (userToUpdate.role === "super admin") {
			return res.status(403).json({
				success: false,
				message: "Cannot Change The Role Of A Super Admin.",
			});
		}

		// Toggle the user's role
		const newRole = userToUpdate.role === "user" ? "admin" : "user";

		// Update the user's role
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ role: newRole },
			{ new: true, runValidators: true }
		);

		return res.status(200).json({
			success: true,
			message: `${updatedUser.firstName} Is Now ${newRole}.`,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};
module.exports = { getUsersByAdmin, getOrdersByUid, UpdateRoleByAdmin };
