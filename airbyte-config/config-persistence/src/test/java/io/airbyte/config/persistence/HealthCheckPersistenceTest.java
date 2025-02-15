/*
 * Copyright (c) 2023 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.config.persistence;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.airbyte.data.services.impls.jooq.OAuthServiceJooqImpl;
import io.airbyte.data.services.impls.jooq.OrganizationServiceJooqImpl;
import io.airbyte.data.services.impls.jooq.WorkspaceServiceJooqImpl;
import io.airbyte.db.Database;
import java.sql.SQLException;
import org.jooq.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HealthCheckPersistenceTest {

  private Database database;
  private ConfigRepository configRepository;

  @BeforeEach
  void beforeEach() throws Exception {

    database = mock(Database.class);
    configRepository = new ConfigRepository(
        database,
        MockData.MAX_SECONDS_BETWEEN_MESSAGE_SUPPLIER,
        new WorkspaceServiceJooqImpl(database),
        new OrganizationServiceJooqImpl(database),
        new OAuthServiceJooqImpl(database));
  }

  @Test
  void testHealthCheckSuccess() throws SQLException {
    final var mResult = mock(Result.class);
    when(database.query(any())).thenReturn(mResult);

    final var check = configRepository.healthCheck();
    assertTrue(check);
  }

  @Test
  void testHealthCheckFailure() throws SQLException {
    when(database.query(any())).thenThrow(RuntimeException.class);

    final var check = configRepository.healthCheck();
    assertFalse(check);
  }

}
