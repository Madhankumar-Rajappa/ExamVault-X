const User = require("../models/User");
const { hashPassword } = require("./security");

const seedInitialData = async () => {
  try {
    const defaultUsers = [
      { name: "System Administrator", email: "admin@examvault.edu", role: "admin" },
      { name: "Question Setter", email: "setter@examvault.edu", role: "question_setter" },
      { name: "Faculty Reviewer", email: "reviewer@examvault.edu", role: "reviewer" },
      { name: "Student User", email: "student@examvault.edu", role: "student" },
    ];

    const hashedPassword = await hashPassword("ExamVault2026!");

    for (const u of defaultUsers) {
      let userDoc = await User.findOne({ email: u.email });
      if (!userDoc) {
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          isActive: true,
        });
        console.log(`🌱 Created demo user: ${u.email} (${u.role})`);
      } else {
        userDoc.password = hashedPassword;
        userDoc.role = u.role;
        userDoc.isActive = true;
        await userDoc.save();
        console.log(`🌱 Verified/reset demo user: ${u.email} (${u.role})`);
      }
    }
  } catch (error) {
    console.error("Seed error:", error.message);
  }
};

module.exports = seedInitialData;
