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
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          isActive: true,
        });
        console.log(`🌱 Seeded default user: ${u.email} (${u.role})`);
      }
    }
  } catch (error) {
    console.error("Seed error:", error.message);
  }
};

module.exports = seedInitialData;
