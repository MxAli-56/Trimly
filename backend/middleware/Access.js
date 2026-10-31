import User from "../model/userModel.js";

export const requiredRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized: No user found in request",
          },
        });
      }
      const user = await User.findById(userId).select("roles deletedAt");

      if (!user || user.deletedAt !== null) {
        return res.status(403).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User account disabled or not found",
          },
        });
      }

      const hasRole = user.roles.some((role) => allowedRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          error: {
            code: "ACCESS_DENIED",
            message:
              "Access denied. You don't have permission for this resource",
          },
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Internal server error during permission check",
        },
      });
    }
  };
};
