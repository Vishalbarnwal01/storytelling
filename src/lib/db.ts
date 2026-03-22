import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(db as any).on("error", (error: any) => {
  console.error("MySQL pool error:", error);
});

export async function signupUser(email: string, name: string, hashedPassword: string) {
  const connection = await db.getConnection();
  try {
    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    const [result] = await connection.query(
      "INSERT INTO users (email, name, password) VALUES (?, ?, ?)",
      [email, name, hashedPassword]
    );

    return { success: true, userId: (result as any).insertId };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function loginUser(email: string) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT id, email, password FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, user: null };
    }

    return { success: true, user: rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function signupUserWithGoogle(email: string, googleId: string, name?: string) {
  const connection = await db.getConnection();
  try {
    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return { success: true, userId: (existingUser[0] as any).id, newUser: false };
    }

    const [result] = await connection.query(
      "INSERT INTO users (email, googleId, name, isGoogleAuth) VALUES (?, ?, ?, ?)",
      [email, googleId, name || '', true]
    );

    return { success: true, userId: (result as any).insertId, newUser: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function getUserByEmail(email: string) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT id, email, name, googleId FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, user: null };
    }

    return { success: true, user: rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function getUserById(userId: number) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      "SELECT id, email, name, password, googleId, isGoogleAuth FROM users WHERE id = ?",
      [userId]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return { success: false, user: null };
    }

    return { success: true, user: rows[0] };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

export async function updateUserProfile(userId: number, name?: string, hashedPassword?: string) {
  const connection = await db.getConnection();
  try {
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    if (hashedPassword !== undefined) {
      updates.push("password = ?");
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return { success: false, error: "No updates provided" };
    }

    values.push(userId);

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await connection.query(query, values);

    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}