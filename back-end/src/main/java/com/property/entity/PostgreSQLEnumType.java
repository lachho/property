package com.property.entity;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

/**
 * Custom type handler for PostgreSQL enum types.
 * This fixes the issue where Hibernate tries to insert string values into PostgreSQL enum columns.
 */
public class PostgreSQLEnumType<E extends Enum<E>> implements UserType<E> {

    private Class<E> enumClass;

    public PostgreSQLEnumType(Class<E> enumClass) {
        this.enumClass = enumClass;
    }

    @Override
    public int getSqlType() {
        return Types.OTHER;
    }

    @Override
    public Class<E> returnedClass() {
        return enumClass;
    }

    @Override
    public boolean equals(E x, E y) {
        return x == y;
    }

    @Override
    public int hashCode(E x) {
        return x == null ? 0 : x.hashCode();
    }

    @Override
    public E nullSafeGet(ResultSet rs, int position, SharedSessionContractImplementor session, Object owner) 
            throws SQLException {
        String name = rs.getString(position);
        return rs.wasNull() ? null : Enum.valueOf(enumClass, name);
    }

    @Override
    public void nullSafeSet(PreparedStatement st, E value, int index, SharedSessionContractImplementor session) 
            throws SQLException {
        if (value == null) {
            st.setNull(index, Types.OTHER);
        } else {
            st.setObject(index, value.name(), Types.OTHER);
        }
    }

    @Override
    public E deepCopy(E value) {
        return value;
    }

    @Override
    public boolean isMutable() {
        return false;
    }

    @Override
    public Serializable disassemble(E value) {
        return value == null ? null : value.name();
    }

    @Override
    public E assemble(Serializable cached, Object owner) {
        return cached == null ? null : Enum.valueOf(enumClass, cached.toString());
    }

    @Override
    public E replace(E detached, E managed, Object owner) {
        return detached;
    }
} 